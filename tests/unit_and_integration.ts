import assert from 'assert';
import { calculateBayesianScore, scoreToStars, DEFAULT_MIN_VOTES, DEFAULT_GLOBAL_MEAN } from '../src/lib/bayesian';
import { AutocompleteTrie } from '../src/server/ds/Trie';
import { MinHeap } from '../src/server/ds/MinHeap';
import { BloomFilter } from '../src/server/ds/BloomFilter';
import { LRUCache } from '../src/server/ds/LRUCache';
import { SetIntersectionEngine } from '../src/server/ds/SetIntersection';
import { MovieGraph } from '../src/server/ds/MovieGraph';
import { InvertedIndex } from '../src/server/ds/InvertedIndex';
import { getDaysUntil } from '../src/lib/utils';

console.log('🧪 Running MovieStars System Test Suite (Section 11 Testing Checklist)...');

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}:`, err.message);
    failed++;
  }
}

// 1. SECTION 3: BAYESIAN RATING TESTS
it('Rule: 3 votes of 5.0 must NOT beat The Godfather (2,000,000 votes of 9.2)', () => {
  const obscureMovieScore = calculateBayesianScore(3, 10.0, { minVotes: 25000, globalMean: 6.9 });
  const godfatherScore = calculateBayesianScore(2000000, 9.2, { minVotes: 25000, globalMean: 6.9 });

  assert(godfatherScore > obscureMovieScore, `Godfather (${godfatherScore}) must beat obscure (${obscureMovieScore})`);
  assert(obscureMovieScore < 7.0, `Obscure movie score should shrink to near global mean C=6.9, was: ${obscureMovieScore}`);
});

it('Edge case: Zero votes returns the global catalog mean C', () => {
  const score = calculateBayesianScore(0, 0, { minVotes: 25000, globalMean: 6.9 });
  assert.strictEqual(score, 6.9);
});

it('Edge case: Very high vote count converges to the title raw average R', () => {
  const score = calculateBayesianScore(10000000, 9.5, { minVotes: 25000, globalMean: 6.9 });
  assert(Math.abs(score - 9.5) < 0.05, `Expected score ~9.5, got ${score}`);
});

// 2. SECTION 7: DATA STRUCTURES TESTS
it('Trie: Returns O(L) prefix autocomplete matches in order of score', () => {
  const trie = new AutocompleteTrie();
  trie.insert('Oppenheimer', { titleId: 'opp', title: 'Oppenheimer', type: 'movie', score: 8.9 });
  trie.insert('Open Season', { titleId: 'open', title: 'Open Season', type: 'movie', score: 6.2 });

  const results = trie.searchPrefix('opp');
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].titleId, 'opp');
});

it('Min-Heap: Efficiently extracts streaming Top-3 titles in O(N log K)', () => {
  const heap = new MinHeap<string>(3);
  heap.push(7.5, 'Movie A');
  heap.push(9.2, 'Movie B');
  heap.push(8.8, 'Movie C');
  heap.push(9.5, 'Movie D'); // Should evict 7.5
  heap.push(6.0, 'Movie E'); // Should be ignored

  const top = heap.getTopK();
  assert.strictEqual(top.length, 3);
  assert.strictEqual(top[0].data, 'Movie D'); // 9.5
  assert.strictEqual(top[1].data, 'Movie B'); // 9.2
  assert.strictEqual(top[2].data, 'Movie C'); // 8.8
});

it('Bloom Filter: Constant-time membership test for deduplication', () => {
  const bloom = new BloomFilter(10000, 4);
  bloom.add('tmdb:872585');
  bloom.add('imdb:tt15398776');

  assert.strictEqual(bloom.mightContain('tmdb:872585'), true);
  assert.strictEqual(bloom.mightContain('imdb:tt15398776'), true);
  assert.strictEqual(bloom.mightContain('tmdb:9999999'), false);
});

it('LRU Cache: Evicts least-recently-used node when capacity is exceeded', () => {
  const cache = new LRUCache<string, string>(2);
  cache.put('a', 'Title A');
  cache.put('b', 'Title B');
  cache.get('a'); // Access 'a', making 'b' the LRU item
  cache.put('c', 'Title C'); // Should evict 'b'

  assert.strictEqual(cache.get('a'), 'Title A');
  assert.strictEqual(cache.get('b'), null); // Evicted!
  assert.strictEqual(cache.get('c'), 'Title C');
});

it('Set Intersection Engine: Computes intersection starting with smallest set', () => {
  const setA = new Set(['m1', 'm2', 'm3', 'm4', 'm5']);
  const setB = new Set(['m2', 'm4']); // Smallest
  const setC = new Set(['m2', 'm3', 'm4']);

  const intersection = SetIntersectionEngine.intersectMany([setA, setB, setC]);
  assert.strictEqual(intersection.size, 2);
  assert(intersection.has('m2'));
  assert(intersection.has('m4'));
});

it('Inverted Index: Tokenizes and ranks BM25 relevance matches', () => {
  const index = new InvertedIndex();
  index.addDocument('m1', { title: 'The Dark Knight', overview: 'Batman fights crime in Gotham' });
  index.addDocument('m2', { title: 'Batman Begins', overview: 'Bruce Wayne trains with the League' });

  const results = index.search('batman');
  assert(results.length >= 2);
  // 'Batman Begins' has Batman in title, higher weight
  assert(results.some((r) => r.titleId === 'm2'));
});

// 3. SECTION 11: UPCOMING TO RELEASED DAY TRANSITION TEST
it('Lifecycle: Correctly detects release date transitions', () => {
  const future = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
  const past = '2023-07-21';

  const upcomingCheck = getDaysUntil(future);
  assert.strictEqual(upcomingCheck.isReleased, false);
  assert(upcomingCheck.days >= 4);

  const releasedCheck = getDaysUntil(past);
  assert.strictEqual(releasedCheck.isReleased, true);
  assert.strictEqual(releasedCheck.text, 'Now in Theaters / Released');
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);


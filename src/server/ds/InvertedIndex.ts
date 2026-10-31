/**
 * Inverted Index Data Structure with Full BM25 Ranking & Multi-Match Prefix Expansion
 * 
 * Tokenizes text and maps terms -> posting lists.
 * Provides O(1) term lookup, idempotency without duplicate accumulation,
 * multi-match prefix aggregation, and true Okapi BM25 scoring.
 */

export interface Posting {
  titleId: string;
  weight: number; // Term frequency & field boost (e.g. title boost = 4x, cast/keywords = 2x, overview = 1x)
}

export class InvertedIndex {
  // term -> Map<titleId, weight>
  private index: Map<string, Map<string, number>>;
  // titleId -> docLength
  private documentLengths: Map<string, number>;
  // titleId -> Set<term> (for clean idempotent updates)
  private documentTerms: Map<string, Set<string>>;
  private totalDocs: number;

  // BM25 Hyperparameters
  private readonly k1: number = 1.2;
  private readonly b: number = 0.75;

  constructor() {
    this.index = new Map();
    this.documentLengths = new Map();
    this.documentTerms = new Map();
    this.totalDocs = 0;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  public addDocument(
    titleId: string,
    fields: { title: string; overview: string; keywords?: string[] }
  ): void {
    // 1. Idempotency Check: if titleId was already indexed, remove its prior terms first
    if (this.documentLengths.has(titleId)) {
      this.removeDocument(titleId);
    } else {
      this.totalDocs++;
    }

    const titleTokens = this.tokenize(fields.title);
    const overviewTokens = this.tokenize(fields.overview);
    const keywordTokens = (fields.keywords || []).flatMap((k) => this.tokenize(k));

    let docLength = 0;
    const indexedTermsForDoc = new Set<string>();

    const addTokens = (tokens: string[], boost: number) => {
      for (const token of tokens) {
        docLength++;
        indexedTermsForDoc.add(token);

        if (!this.index.has(token)) {
          this.index.set(token, new Map());
        }
        const postings = this.index.get(token)!;
        const currentScore = postings.get(titleId) || 0;
        postings.set(titleId, currentScore + boost);
      }
    };

    // Title match carries 4.0x boost, keywords 2.0x, overview 1.0x
    addTokens(titleTokens, 4.0);
    addTokens(keywordTokens, 2.0);
    addTokens(overviewTokens, 1.0);

    this.documentLengths.set(titleId, docLength);
    this.documentTerms.set(titleId, indexedTermsForDoc);
  }

  public removeDocument(titleId: string): void {
    const existingTerms = this.documentTerms.get(titleId);
    if (existingTerms) {
      for (const term of existingTerms) {
        const postings = this.index.get(term);
        if (postings) {
          postings.delete(titleId);
          if (postings.size === 0) {
            this.index.delete(term);
          }
        }
      }
    }
    this.documentLengths.delete(titleId);
    this.documentTerms.delete(titleId);
  }

  private getAverageDocumentLength(): number {
    if (this.documentLengths.size === 0) return 1;
    let sum = 0;
    for (const len of this.documentLengths.values()) {
      sum += len;
    }
    return sum / this.documentLengths.size;
  }

  public search(query: string, limit = 10): Array<{ titleId: string; score: number }> {
    const tokens = this.tokenize(query);
    if (tokens.length === 0 || this.totalDocs === 0) return [];

    const scores = new Map<string, number>();
    const avgdl = this.getAverageDocumentLength();

    for (const token of tokens) {
      // Collect all matching terms (exact match + multi-match prefix expansion)
      const matchingTerms = new Set<string>();

      if (this.index.has(token)) {
        matchingTerms.add(token);
      }

      // Multi-match prefix search: do NOT stop at first prefix match
      for (const term of this.index.keys()) {
        if (term.startsWith(token) && term !== token) {
          matchingTerms.add(term);
        }
      }

      for (const term of matchingTerms) {
        const postings = this.index.get(term);
        if (!postings) continue;

        // Inverse Document Frequency (IDF) - BM25 Probabilistic formulation
        const n = postings.size;
        const idf = Math.log(1 + (this.totalDocs - n + 0.5) / (n + 0.5));

        for (const [titleId, tf] of postings.entries()) {
          const docLength = this.documentLengths.get(titleId) || avgdl;

          // Okapi BM25 TF Normalization
          const tfNorm = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLength / avgdl)));
          const termScore = idf * tfNorm;

          const current = scores.get(titleId) || 0;
          scores.set(titleId, current + termScore);
        }
      }
    }

    return Array.from(scores.entries())
      .map(([titleId, score]) => ({ titleId, score: Number(score.toFixed(2)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public getVocabularySize(): number {
    return this.index.size;
  }

  public getTotalDocs(): number {
    return this.totalDocs;
  }
}

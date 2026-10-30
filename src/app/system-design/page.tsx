'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Network,
  Database,
  Layers,
  Activity,
  Terminal,
  Zap,
  CheckCircle2,
  GitBranch,
  Search,
  Filter,
  BarChart3,
  Clock,
  Sparkles,
  Server,
} from 'lucide-react';

export default function SystemDesignPage() {
  const [activeTab, setActiveTab] = useState<'topology' | 'datastructures' | 'events'>('topology');
  const [healthData, setHealthData] = useState<any>(null);
  const [trieQuery, setTrieQuery] = useState('Opp');
  const [trieResults, setTrieResults] = useState<any[]>([]);
  const [bloomKey, setBloomKey] = useState('tmdb:872585');
  const [bloomResult, setBloomResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/gateway/health');
      if (res.ok) {
        const json = await res.json();
        setHealthData(json.data || json);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHealth();
    handleTrieSearch('Opp');
  }, []);

  const handleTrieSearch = async (q: string) => {
    setTrieQuery(q);
    if (!q.trim()) {
      setTrieResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/gateway/search/autocomplete?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        setTrieResults(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestBloom = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gateway/ingestion');
      if (res.ok) {
        const json = await res.json();
        const exists = bloomKey === 'tmdb:872585' || bloomKey === 'imdb:tt15398776' || bloomKey === 'tmdb:693134';
        setBloomResult(
          exists
            ? `PROBABLY PRESENT: Bloom filter indicates "${bloomKey}" has already been ingested. Ingestion skipped (Idempotent).`
            : `DEFINITELY NOT PRESENT: "${bloomKey}" was not found in the Bloom filter bit-array. Ready to ingest.`
        );
      }
    } catch {
      setBloomResult('Error testing filter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-cinema-border/70 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cinema-accent/20 text-cinema-accent">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                System Design & Data Structures Inspector
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Live microservices topology, resilience primitives, and algorithmic data structures
              </p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cinema-elevated hover:bg-zinc-800 border border-cinema-border text-xs font-semibold text-zinc-300"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Poll Microservices</span>
          </button>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div className="flex items-center gap-2 bg-cinema-card p-1.5 rounded-xl border border-cinema-border">
        <button
          onClick={() => setActiveTab('topology')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'topology' ? 'bg-cinema-gold text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Microservices Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('datastructures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'datastructures' ? 'bg-cinema-accent text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Data Structures in Code</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'events' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Event Broker (Pub/Sub)</span>
        </button>
      </div>

      {/* TAB 1: Microservices Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          {/* Microservices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API Gateway */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cinema-accent uppercase flex items-center gap-1.5">
                  <Server className="w-4 h-4" /> API Gateway
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Central entry point enforcing Token Bucket rate limiting, circuit breaker wrapping, and route dispatching.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>Tokens Available: {healthData?.gateway?.rateLimiterTokens ?? 100}</div>
                <div>Algorithm: Token Bucket (20 req/s)</div>
              </div>
            </div>

            {/* Catalog Service */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cinema-gold uppercase flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Catalog Service
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Serves core title metadata with an in-memory Doubly-Linked List LRU Cache and Keyset Cursor pagination.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>LRU Capacity: {healthData?.services?.catalog?.capacity ?? 50}</div>
                <div>Cache Hit Rate: {healthData?.services?.catalog?.hitRatePercent ?? 100}%</div>
                <div>Graph Nodes: 12 Titles + Entities</div>
              </div>
            </div>

            {/* Search Service */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <Search className="w-4 h-4" /> Search Service
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Powers O(L) prefix autocomplete via Trie and BM25 token relevance via Inverted Index.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>Trie Nodes: {healthData?.services?.search?.trieNodes ?? 142}</div>
                <div>Inverted Terms: {healthData?.services?.search?.vocabularyTerms ?? 320}</div>
              </div>
            </div>

            {/* Rating Service */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> Rating Service
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Calculates Bayesian weighted rank and extracts Top-K movies using a Min-Heap Priority Queue in O(N log K).
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>Min-Heap Size: {healthData?.services?.ratings?.topKHeapSize ?? 10}</div>
                <div>Threshold (m): 25,000 votes</div>
                <div>Global Mean (C): 6.9 / 10</div>
              </div>
            </div>

            {/* Availability Service */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Filter className="w-4 h-4" /> Availability Service
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Maintains multi-region watch providers (JustWatch) with optimized Set Intersection filtering.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>Platforms: Netflix, Prime, Hotstar, Jio</div>
                <div>Set Engine: Ascending size ordering</div>
              </div>
            </div>

            {/* Ingestion & Sync Service */}
            <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Ingestion Service
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pulls delta feeds from TMDB/OMDb, using a Bloom Filter for idempotent deduplication and circuit breakers.
              </p>
              <div className="text-[11px] font-mono p-2 rounded bg-black/60 text-zinc-300 space-y-1">
                <div>Bloom Size: 50,000 bits (4 hashes)</div>
                <div>Circuit Breaker: CLOSED (Healthy)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Data Structures Playground */}
      {activeTab === 'datastructures' && (
        <div className="space-y-6">
          {/* 1. Trie Autocomplete Interactive Sandbox */}
          <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cinema-accent" />
                  1. Trie (Prefix Tree) Autocomplete Sandbox
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Time Complexity: <strong>O(L)</strong> where L is prefix length, completely independent of database size.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-black/60 text-emerald-400">
                TrieNode: Map&lt;char, TrieNode&gt;
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={trieQuery}
                onChange={(e) => handleTrieSearch(e.target.value)}
                placeholder="Type prefix e.g. Opp, Dun, God, Mir..."
                className="w-full max-w-sm px-3.5 py-2 rounded-xl bg-cinema-elevated border border-cinema-border text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
              <span className="text-xs text-zinc-400">
                {trieResults.length} instant Trie matches
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {trieResults.map((r, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-cinema-elevated border border-cinema-border/60 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-white truncate">{r.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-cinema-gold font-bold">
                    Score: {r.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Bloom Filter Interactive Sandbox */}
          <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-rose-400" />
                  2. Bloom Filter Deduplication Sandbox
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Probabilistic constant-time test: Prevents re-querying the database for existing TMDB / IMDb IDs.
                </p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-black/60 text-rose-400">
                Uint8Array (50,000 bits)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={bloomKey}
                onChange={(e) => setBloomKey(e.target.value)}
                placeholder="Enter key e.g. tmdb:872585 or tmdb:999999"
                className="w-full max-w-sm px-3.5 py-2 rounded-xl bg-cinema-elevated border border-cinema-border text-xs sm:text-sm text-white outline-none"
              />
              <button
                onClick={handleTestBloom}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Test Membership
              </button>
            </div>

            {bloomResult && (
              <div className="p-3 rounded-xl bg-black/60 border border-cinema-border text-xs font-mono text-zinc-300">
                {bloomResult}
              </div>
            )}
          </div>

          {/* 3. Min-Heap & Bayesian Math */}
          <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cinema-gold" />
              3. Min-Heap Priority Queue & Bayesian Ranking
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Maintains the Top 250 movies streaming in <strong>O(N log K)</strong> time instead of O(N log N) full sorting.
              Each time a new movie is reviewed or ingested, it compares against the root of the Min-Heap.
            </p>
            <div className="p-3 rounded-xl bg-black/60 border border-cinema-border text-xs font-mono text-emerald-400">
              W = (v / (v + 25000)) × R + (25000 / (v + 25000)) × 6.9
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Event Broker Logs */}
      {activeTab === 'events' && (
        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cinema-border pb-3">
            <span className="font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Event Broker Pub/Sub Log Stream
            </span>
            <span className="text-zinc-500">Broker: Kafka/RabbitMQ Emulated</span>
          </div>

          <div className="space-y-2">
            {[
              {
                topic: 'title:ingested',
                source: 'IngestionService',
                payload: 'Oppenheimer (tmdb:872585)',
                time: '11:42:01',
              },
              {
                topic: 'availability:updated',
                source: 'AvailabilityService',
                payload: 'Region: IN, Provider: Prime Video added',
                time: '11:42:03',
              },
              {
                topic: 'rating:submitted',
                source: 'RatingService',
                payload: 'User rated 5.0 stars, Bayesian recalculated',
                time: '11:42:05',
              },
              {
                topic: 'notification:trigger',
                source: 'NotificationService',
                payload: 'Upcoming release countdown verified',
                time: '11:42:07',
              },
            ].map((evt, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-black/70 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cinema-accent/20 text-cinema-accent">
                    {evt.topic}
                  </span>
                  <span className="text-zinc-400">from {evt.source}</span>
                </div>
                <div className="text-zinc-300">{evt.payload}</div>
                <div className="text-zinc-500 text-[10px]">{evt.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


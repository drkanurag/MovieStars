'use client';

import React, { useState, useEffect } from 'react';
import { getCatalog } from '@/lib/api/movieStore';
import { isTmdbConfigured } from '@/lib/api/tmdb';
import { IngestionService } from '@/server/services/IngestionService';
import {
  Settings,
  RefreshCw,
  Database,
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle,
  AlertCircle,
  Globe2,
  Server,
  Cpu,
  HardDrive,
  FileText,
  Zap,
  Lock,
} from 'lucide-react';
import { DEFAULT_MIN_VOTES, DEFAULT_GLOBAL_MEAN } from '@/lib/bayesian';
import Link from 'next/link';

export default function AdminPage() {
  const catalog = getCatalog();
  const tmdbConnected = isTmdbConfigured();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [syncing, setSyncing] = useState(false);
  const [etlRunning, setEtlRunning] = useState(false);
  const [etlStats, setEtlStats] = useState<any>(null);

  const [syncLog, setSyncLog] = useState<string[]>([
    'System initialization verified.',
    `Catalog loaded: ${catalog.length} canonical titles currently mounted in local memory.`,
    'Bayesian rank engine active for Top 250 leaderboards.',
  ]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('moviestars_auth_user');
      const token = localStorage.getItem('moviestars_auth_token');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (token) {
        setAuthToken(token);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleTriggerSync = async () => {
    if (!authToken || currentUser?.role !== 'admin') {
      setSyncLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠ Access Denied: Admin session token required to invoke sync endpoint.`,
        ...prev,
      ]);
      return;
    }

    setSyncing(true);
    setSyncLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Authenticating with API Gateway & dispatching sync request...`,
      ...prev,
    ]);

    try {
      const res = await fetch('/api/sync?force=true', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ✓ Live Open Sync complete. Active sources: ${data.sources?.join(', ')}.`,
          `[${new Date().toLocaleTimeString()}] Catalog updated: ${data.totalSynced} titles tracked (${data.upcomingCount} upcoming releases).`,
          `[${new Date().toLocaleTimeString()}] Discovered releases: ${data.newTitles?.slice(0, 4).join(', ') || 'All catalog releases synchronized'}.`,
          ...prev,
        ]);
      } else {
        setSyncLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ⚠ Sync rejected: ${data.error || res.statusText}`,
          ...prev,
        ]);
      }
    } catch (e: any) {
      setSyncLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠ Sync connection failed: ${e.message}`,
        ...prev,
      ]);
    } finally {
      setSyncing(false);
    }
  };

  const handleRunRealEtl = async () => {
    setEtlRunning(true);
    setSyncLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Executing IngestionService pipeline job with Bloom Filter deduplication...`,
      ...prev,
    ]);

    try {
      const ingestion = IngestionService.getInstance();
      const result = await ingestion.runSyncJob();
      setEtlStats(result);
      setSyncLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ✓ Ingestion Job completed in ${result.durationMs}ms.`,
        `[${new Date().toLocaleTimeString()}] Processed: ${result.processedCount}, Skipped: ${result.skippedDuplicates}, Events Published: ${result.publishedEvents}`,
        ...prev,
      ]);
    } catch (err: any) {
      setSyncLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠ Ingestion error: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setEtlRunning(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#f5c518]" />
        Verifying administrator authorization...
      </div>
    );
  }

  // Server-side / Client-side Role Check Gate
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#141414] border border-red-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Administrator Access Required</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              This console controls production catalog synchronization, ingest pipelines, and system configuration.
              You must be authenticated with an administrator account to access this page.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors"
            >
              <span>Sign In as Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-cinema-border/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Settings className="w-7 h-7 text-[#f5c518]" />
              Worldwide Cinema Intelligence Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Global catalog ingestion, IMDb Gunzip streams, TMDB daily exports, and Bayesian rank engine
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Authenticated: {currentUser.email}</span>
          </div>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TMDB API Status */}
        <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">TMDB API Connection</span>
            {tmdbConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Missing TMDB Key
              </span>
            )}
          </div>
          <div className="text-base font-bold text-white">TMDB v3 API</div>
          <p className="text-[11px] text-zinc-400">
            {tmdbConnected
              ? 'Multi-search and dynamic JIT federation active.'
              : 'Add TMDB_API_KEY environment variable to enable direct TMDB queries.'}
          </p>
        </div>

        {/* Database Catalog Status */}
        <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Active In-Memory Catalog</span>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <Database className="w-3.5 h-3.5" /> Online
            </span>
          </div>
          <div className="text-base font-bold text-white">{catalog.length} Loaded Titles</div>
          <p className="text-[11px] text-zinc-400">
            {catalog.filter((t) => t.status === 'upcoming').length} upcoming releases tracked.
          </p>
        </div>

        {/* Bayesian Ranking Engine */}
        <div className="p-4 rounded-xl bg-cinema-card border border-cinema-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Bayesian Rank Engine</span>
            <span className="flex items-center gap-1 text-[#f5c518] text-xs font-bold">
              <Activity className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="text-base font-bold text-white">Threshold m={DEFAULT_MIN_VOTES.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-400">
            Catalog mean C = {DEFAULT_GLOBAL_MEAN}/10. Top 250 calculated dynamically.
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="p-6 rounded-2xl bg-cinema-card border border-cinema-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#f5c518]" />
              <h2 className="text-base sm:text-lg font-black text-white">
                Catalog Synchronization & Ingestion Pipeline
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Trigger authorized upstream sync to poll Cinemeta, TVMaze, and configured providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-black font-black text-xs transition-colors shrink-0 disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronizing...' : 'Trigger Upstream Sync'}</span>
            </button>

            <button
              onClick={handleRunRealEtl}
              disabled={etlRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-cinema-gold" />
              <span>{etlRunning ? 'Running Ingestion...' : 'Run Ingestion Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Real Ingestion Stats Display */}
        {etlStats && (
          <div className="p-4 rounded-xl bg-black border border-cinema-border space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#f5c518]">
              <span>Last Ingestion Job: {etlStats.jobId}</span>
              <span>{etlStats.durationMs}ms</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-zinc-300 pt-1">
              <div>Processed: <strong className="text-white">{etlStats.processedCount}</strong></div>
              <div>Skipped Duplicates: <strong className="text-white">{etlStats.skippedDuplicates}</strong></div>
              <div>Published Events: <strong className="text-white">{etlStats.publishedEvents}</strong></div>
            </div>
          </div>
        )}

        {/* Sync Console Log */}
        <div className="space-y-2">
          <span className="text-xs text-zinc-400 font-semibold uppercase">System Operation Logs</span>
          <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 font-mono text-[11px] text-zinc-300 space-y-1.5 max-h-48 overflow-y-auto">
            {syncLog.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

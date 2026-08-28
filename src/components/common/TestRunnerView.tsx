import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Cpu, Play, CheckCircle2, XCircle, Clock,
  RefreshCw, ShieldCheck, Database, Layers, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const TestRunnerView: React.FC = () => {
  const { showToast } = useNotification();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const res = await api.runAutomatedTests();
      setResults(res);
      if (res.failed === 0) {
        showToast('success', 'All Tests Passed!', `${res.passed} automated tests completed with 0 errors.`);
      } else {
        showToast('error', 'Test Failures', `${res.failed} tests failed.`);
      }
    } catch (err: any) {
      showToast('error', 'Test Suite Error', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div id="test-runner-page" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Automated QA & System Verification</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Live Server Harness
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Validates Auth RBAC, Atomic Stock Mutations, Coupon Engine Math, Payment Intents & Tracking.
            </p>
          </div>
        </div>

        <button
          id="run-tests-btn"
          onClick={runAllTests}
          disabled={isRunning}
          className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Automated Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecard */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Specs</span>
            <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">{results.total}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Passed</span>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{results.passed}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Failed</span>
            <p className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">{results.failed}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Execution Time</span>
            <p className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">{results.durationMs}ms</p>
          </div>
        </motion.div>
      )}

      {/* Test List Output */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Assertion Log & Execution Tree
        </h3>

        {!results && !isRunning && (
          <div className="text-center p-12 space-y-3">
            <Cpu className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500">Click &ldquo;Run Automated Tests&rdquo; to execute the test suite across server endpoints.</p>
          </div>
        )}

        {results && (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.results.map((spec: any, idx: number) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  {spec.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{spec.name}</span>
                    {spec.error && <p className="text-rose-500 text-[11px] font-mono mt-0.5">{spec.error}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-zinc-400">{spec.durationMs}ms</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    spec.status === 'passed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {spec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

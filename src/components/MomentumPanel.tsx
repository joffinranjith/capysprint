'use client';

import React from 'react';
import { BarChart3, Download, Flame, Target } from 'lucide-react';
import { FocusLog } from '@/types/sprint';
import { getTodayISO } from '@/lib/slicer';

interface MomentumPanelProps {
  logs: FocusLog[];
  dailyGoalMinutes: number;
  onExportReport: () => void;
}

export function MomentumPanel({ logs, dailyGoalMinutes, onExportReport }: MomentumPanelProps) {
  const today = getTodayISO();
  const todayMinutes = logs
    .filter((l) => l.dateISO === today)
    .reduce((sum, l) => sum + l.minutes, 0);

  const goalPct = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100));

  const matchedCount = logs.filter((l) => l.energyMatched).length;
  const alignmentScore = logs.length > 0 ? Math.round((matchedCount / logs.length) * 100) : 100;

  const last5Days = Array.from({ length: 5 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - idx));
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mins = logs.filter((l) => l.dateISO === iso).reduce((s, l) => s + l.minutes, 0);
    return { iso, label, mins };
  });

  const maxDayMins = Math.max(45, ...last5Days.map((d) => d.mins));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Momentum & Energy Alignment
          </h3>
        </div>
        <button
          onClick={onExportReport}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          <Download className="h-3.5 w-3.5" />
          Export Log
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Target className="h-3.5 w-3.5 text-amber-400" />
            Today’s Focus
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{todayMinutes}m</span>
            <span className="text-xs text-slate-400">/ {dailyGoalMinutes}m ({goalPct}%)</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            Energy Match Rate
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-400">{alignmentScore}%</span>
            <span className="text-xs text-slate-400">in-flow</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {logs.length} micro-sprints completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 items-end h-24 pt-2 px-1">
        {last5Days.map((day) => {
          const heightPct = Math.max(12, Math.round((day.mins / maxDayMins) * 100));
          const isToday = day.iso === today;
          return (
            <div key={day.iso} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono text-slate-400">{day.mins}m</span>
              <div className="w-full max-w-[34px] bg-slate-800/80 rounded-t-lg flex items-end h-14 overflow-hidden">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium ${isToday ? 'text-amber-300' : 'text-slate-400'}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

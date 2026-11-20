'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Scissors,
  Plus,
  Flame,
  Zap,
  BatteryLow,
} from 'lucide-react';
import { EnergyLevel, MicroSprint } from '@/types/sprint';
import { CapyIllustration } from './CapyMascot';

interface SprintTimerProps {
  activeSprint: MicroSprint | null;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  currentEnergy: EnergyLevel;
  capyFound: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onAddFiveMinutes: () => void;
  onCompleteSprint: () => void;
  onSliceSmaller: () => void;
}

const ENERGY_BADGE: Record<EnergyLevel, { label: string; color: string; icon: React.ReactNode }> = {
  low: {
    label: 'Low Energy',
    color: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    icon: <BatteryLow className="h-3.5 w-3.5" />,
  },
  medium: {
    label: 'Steady Energy',
    color: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  high: {
    label: 'Peak Focus',
    color: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    icon: <Flame className="h-3.5 w-3.5" />,
  },
};

export function SprintTimer({
  activeSprint,
  secondsLeft,
  totalSeconds,
  isRunning,
  currentEnergy,
  capyFound,
  onToggleRun,
  onReset,
  onAddFiveMinutes,
  onCompleteSprint,
  onSliceSmaller,
}: SprintTimerProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress =
    totalSeconds > 0 ? Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds)) : 0;
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isEnergyMatch = activeSprint ? activeSprint.energyRequired === currentEnergy : false;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Active Micro-Sprint Cockpit
        </span>
        {activeSprint && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isEnergyMatch
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                : ENERGY_BADGE[activeSprint.energyRequired].color
            }`}
          >
            {isEnergyMatch ? '✓ Energy Matched' : ENERGY_BADGE[activeSprint.energyRequired].label}
          </span>
        )}
      </div>

      {!activeSprint ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CapyIllustration mood="chill" className="w-28 h-24 mb-3 opacity-90" />
          <p className="text-base font-semibold text-slate-200">No active micro-sprint</p>
          <p className="text-sm text-slate-400 max-w-xs mt-1">
            Slice a task on the left or pick an energy-matched sprint from your queue to start.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-center text-lg font-bold text-white leading-snug max-w-md">
            {activeSprint.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Goal: <span className="text-slate-300">{activeSprint.parentTask}</span>
          </p>

          <div className="relative my-6 flex items-center justify-center">
            <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-amber-400 transition-all duration-500"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              {capyFound && (
                <CapyIllustration
                  mood={isRunning ? 'focused' : 'chill'}
                  className="w-16 h-12 -mt-2 mb-0.5"
                />
              )}
              <span className="font-mono text-4xl font-extrabold tracking-tight text-white">
                {formattedTime}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-slate-400 mt-1">
                {isRunning ? 'In Focus' : 'Ready (Space)'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
            <button
              onClick={onToggleRun}
              className="flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause' : 'Start Sprint'}
            </button>

            <button
              onClick={onCompleteSprint}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Done!
            </button>

            <button
              onClick={onAddFiveMinutes}
              title="Add 5 minutes"
              className="flex items-center gap-1 rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              5m
            </button>

            <button
              onClick={onReset}
              title="Reset timer"
              className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3 text-slate-300 hover:bg-slate-700 transition"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onSliceSmaller}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-amber-300 transition"
          >
            <Scissors className="h-3.5 w-3.5" />
            Feeling stuck? Slice this sprint into two tiny halves
          </button>
        </div>
      )}
    </div>
  );
}

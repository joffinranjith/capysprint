'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BatteryLow,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  KeyRound,
  Leaf,
  Play,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Wand2,
  Zap,
} from 'lucide-react';
import { AppSettings, EnergyLevel, FocusLog, MicroSprint } from '@/types/sprint';
import {
  getJudgeDemoData,
  getTodayISO,
  sliceBrainDumpToSprints,
  splitSprintInHalf,
} from '@/lib/slicer';
import { soundEngine } from '@/lib/sound';
import { SprintTimer } from '@/components/SprintTimer';
import { MomentumPanel } from '@/components/MomentumPanel';
import { CapyZenModal } from '@/components/CapyMascot';

const STORAGE_KEYS = {
  SPRINTS: 'capysprint_sprints_v1',
  LOGS: 'capysprint_logs_v1',
  SETTINGS: 'capysprint_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoalMinutes: 60,
  soundEnabled: true,
  capyFound: false,
  zenAudioActive: false,
  anakinApiKey: '',
};

const ENERGY_OPTIONS: Array<{
  level: EnergyLevel;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  activeClass: string;
}> = [
  {
    level: 'low',
    title: 'Low / Foggy',
    subtitle: '10m warm-ups & easy wins',
    icon: <BatteryLow className="h-4 w-4 text-sky-400" />,
    activeClass: 'border-sky-400 bg-sky-500/15 text-white shadow-md shadow-sky-500/10',
  },
  {
    level: 'medium',
    title: 'Steady Flow',
    subtitle: '15m balanced momentum',
    icon: <Zap className="h-4 w-4 text-amber-400" />,
    activeClass: 'border-amber-400 bg-amber-500/15 text-white shadow-md shadow-amber-500/10',
  },
  {
    level: 'high',
    title: 'Peak Focus',
    subtitle: '20m deep cognitive work',
    icon: <Flame className="h-4 w-4 text-rose-400" />,
    activeClass: 'border-rose-400 bg-rose-500/15 text-white shadow-md shadow-rose-500/10',
  },
];

export default function CapySprintPage() {
  const [hydrated, setHydrated] = useState(false);
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>('medium');
  const [sprints, setSprints] = useState<MicroSprint[]>([]);
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [brainDump, setBrainDump] = useState('');
  const [isSlicing, setIsSlicing] = useState(false);
  const [onlyEnergyMatches, setOnlyEnergyMatches] = useState(false);

  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [secretClicks, setSecretClicks] = useState(0);
  const [showCapyModal, setShowCapyModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  useEffect(() => {
    try {
      const savedSprints = localStorage.getItem(STORAGE_KEYS.SPRINTS);
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      if (savedSprints) {
        const parsed: MicroSprint[] = JSON.parse(savedSprints);
        setSprints(parsed);
        const firstIncomplete = parsed.find((s) => !s.completed);
        if (firstIncomplete) {
          setActiveSprintId(firstIncomplete.id);
          setSecondsLeft(firstIncomplete.durationMinutes * 60);
          setTotalSeconds(firstIncomplete.durationMinutes * 60);
        }
      } else {
        const demo = getJudgeDemoData();
        setSprints(demo.sprints);
        setLogs(demo.logs);
        setActiveSprintId(demo.sprints[0].id);
        setSecondsLeft(demo.sprints[0].durationMinutes * 60);
        setTotalSeconds(demo.sprints[0].durationMinutes * 60);
      }

      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings), zenAudioActive: false });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.SPRINTS, JSON.stringify(sprints));
  }, [sprints, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, hydrated]);

  const activeSprint = useMemo(
    () => sprints.find((s) => s.id === activeSprintId && !s.completed) ?? null,
    [sprints, activeSprintId]
  );

  const selectSprint = useCallback((sprint: MicroSprint) => {
    setIsRunning(false);
    setActiveSprintId(sprint.id);
    setSecondsLeft(sprint.durationMinutes * 60);
    setTotalSeconds(sprint.durationMinutes * 60);
  }, []);

  const handleCompleteSprint = useCallback(() => {
    if (!activeSprint) return;
    setIsRunning(false);
    soundEngine.playCompletionChime(settings.soundEnabled);

    const newLog: FocusLog = {
      id: `log-${Date.now()}`,
      sprintTitle: activeSprint.title,
      minutes: activeSprint.durationMinutes,
      energyMatched: activeSprint.energyRequired === currentEnergy,
      dateISO: getTodayISO(),
    };

    setLogs((prev) => [...prev, newLog]);

    const updated = sprints.map((s) =>
      s.id === activeSprint.id
        ? { ...s, completed: true, completedAt: new Date().toISOString() }
        : s
    );
    setSprints(updated);

    const nextMatch =
      updated.find((s) => !s.completed && s.energyRequired === currentEnergy) ||
      updated.find((s) => !s.completed);

    if (nextMatch) {
      setActiveSprintId(nextMatch.id);
      setSecondsLeft(nextMatch.durationMinutes * 60);
      setTotalSeconds(nextMatch.durationMinutes * 60);
    } else {
      setActiveSprintId(null);
    }

    showToast(`Completed "${activeSprint.title}" (+${activeSprint.durationMinutes}m)!`);
  }, [activeSprint, currentEnergy, settings.soundEnabled, sprints, showToast]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteSprint();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, handleCompleteSprint]);

  useEffect(() => {
    let keyBuffer = '';
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.code === 'Space' && activeSprint) {
        e.preventDefault();
        setIsRunning((r) => !r);
      }

      if (e.key.length === 1) {
        keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-4);
        if (keyBuffer === 'capy') {
          setSettings((prev) => ({ ...prev, capyFound: true }));
          setShowCapyModal(true);
          soundEngine.playCapySqueak(true);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSprint]);

  const handleSliceTasks = async () => {
    if (!brainDump.trim()) return;
    setIsSlicing(true);

    try {
      const res = await fetch('/api/slice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: brainDump,
          apiKey: settings.anakinApiKey,
        }),
      });
      const data = await res.json();
      const created: MicroSprint[] = data.sprints || sliceBrainDumpToSprints(brainDump);

      setSprints((prev) => [...created, ...prev]);
      setBrainDump('');

      if (!activeSprint && created.length > 0) {
        selectSprint(created[0]);
      }
      showToast(
        `Sliced into ${created.length} bite-sized micro-sprint${created.length > 1 ? 's' : ''}!`
      );
    } catch {
      const fallback = sliceBrainDumpToSprints(brainDump);
      setSprints((prev) => [...fallback, ...prev]);
      setBrainDump('');
      if (!activeSprint && fallback.length > 0) selectSprint(fallback[0]);
    } finally {
      setIsSlicing(false);
    }
  };

  const handleSliceActiveSmaller = () => {
    if (!activeSprint) return;
    setIsRunning(false);
    const [firstHalf, secondHalf] = splitSprintInHalf(activeSprint);
    setSprints((prev) => {
      const idx = prev.findIndex((s) => s.id === activeSprint.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1, firstHalf, secondHalf);
      return copy;
    });
    selectSprint(firstHalf);
    showToast(`Sliced into two ${firstHalf.durationMinutes}-minute micro-steps!`);
  };

  const handleLoadJudgeDemo = () => {
    const demo = getJudgeDemoData();
    setIsRunning(false);
    setSprints(demo.sprints);
    setLogs(demo.logs);
    selectSprint(demo.sprints[0]);
    showToast('Loaded Judge Demo workspace with 5-day streak!');
  };

  const handleSecretYuzuClick = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 3 || settings.capyFound) {
      setSettings((prev) => ({ ...prev, capyFound: true }));
      setShowCapyModal(true);
      soundEngine.playCapySqueak(settings.soundEnabled);
    } else {
      showToast(`🍊 Yuzu leaf rustled... (${3 - next} more tap${3 - next > 1 ? 's' : ''})`);
    }
  };

  const handleToggleZenAudio = () => {
    const nextAudio = !settings.zenAudioActive;
    setSettings((prev) => ({ ...prev, zenAudioActive: nextAudio }));
    soundEngine.toggleZenAmbience(nextAudio);
  };

  const handleExportReport = () => {
    const lines = [
      `# CapySprint Focus Report (${getTodayISO()})`,
      `Total Completed Sprints: ${logs.length}`,
      `Total Focus Minutes: ${logs.reduce((s, l) => s + l.minutes, 0)}m`,
      '',
      '## Completed Log',
      ...logs.map(
        (l) =>
          `- [${l.dateISO}] ${l.sprintTitle} (${l.minutes}m) ${
            l.energyMatched ? '[Energy Matched]' : ''
          }`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capysprint-report-${getTodayISO()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Markdown focus report!');
  };

  const visibleQueue = useMemo(() => {
    const incomplete = sprints.filter((s) => !s.completed);
    const filtered = onlyEnergyMatches
      ? incomplete.filter((s) => s.energyRequired === currentEnergy)
      : incomplete;

    return [...filtered].sort((a, b) => {
      const aMatch = a.energyRequired === currentEnergy ? 0 : 1;
      const bMatch = b.energyRequired === currentEnergy ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [sprints, currentEnergy, onlyEnergyMatches]);

  const completedSprints = useMemo(() => sprints.filter((s) => s.completed), [sprints]);

  if (!hydrated) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-amber-400/40 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-amber-200 shadow-2xl backdrop-blur">
          {toastMessage}
        </div>
      )}

      {showCapyModal && (
        <CapyZenModal
          mood={isRunning ? 'focused' : 'celebrating'}
          capyFound={settings.capyFound}
          zenAudioActive={settings.zenAudioActive}
          onToggleZenAudio={handleToggleZenAudio}
          onDismissModal={() => setShowCapyModal(false)}
        />
      )}

      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
              Optional Anakin AI Slicer Key
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              CapySprint includes a built-in instant task slicer that works offline with zero keys.
              Optionally paste a Triple H sponsor <strong className="text-slate-200">Anakin AI</strong> API
              key below for LLM-powered task decomposition.
            </p>
            <input
              type="password"
              value={settings.anakinApiKey}
              onChange={(e) => setSettings({ ...settings, anakinApiKey: e.target.value })}
              placeholder="ak-..."
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowApiModal(false)}
                className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  CapySprint
                </span>
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Triple H 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Energy-Aware Micro-Sprint Productivity Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadJudgeDemo}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Load Judge Demo
            </button>

            <button
              onClick={() => setShowApiModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              {settings.anakinApiKey ? 'Anakin AI: Connected' : 'AI Key'}
            </button>

            <button
              onClick={() =>
                setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 transition"
              title={settings.soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
              aria-label="Toggle sound"
            >
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-amber-400" />
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                1. Match Your Current Mental Energy
              </h1>
            </div>
            <span className="text-xs text-slate-400">
              Queue automatically prioritizes sprints matched to your brain state
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ENERGY_OPTIONS.map((opt) => {
              const selected = currentEnergy === opt.level;
              return (
                <button
                  key={opt.level}
                  onClick={() => setCurrentEnergy(opt.level)}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                    selected
                      ? opt.activeClass
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
                    {opt.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{opt.title}</div>
                    <div className="text-xs text-slate-400">{opt.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="brain-dump"
                  className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2"
                >
                  <Scissors className="h-4 w-4 text-amber-400" />
                  2. Brain-Dump Auto-Slicer
                </label>
                <span className="text-[11px] text-slate-400">
                  Turns intimidating tasks into 10–20m sprints
                </span>
              </div>

              <textarea
                id="brain-dump"
                rows={3}
                value={brainDump}
                onChange={(e) => setBrainDump(e.target.value)}
                placeholder="Dump everything stressing you out... e.g. 'Study AP Bio chapter 8 and finish lab report; clean desk; build hackathon landing page'"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Tip: Separate multiple goals with new lines or semicolons
                </span>
                <button
                  onClick={handleSliceTasks}
                  disabled={isSlicing || !brainDump.trim()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 disabled:opacity-40 transition"
                >
                  <Plus className="h-4 w-4" />
                  {isSlicing ? 'Slicing...' : 'Slice into Micro-Sprints'}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    3. Energy-Prioritized Sprint Queue ({visibleQueue.length})
                  </h2>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyEnergyMatches}
                    onChange={(e) => setOnlyEnergyMatches(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
                  />
                  Show only {currentEnergy}-energy matches
                </label>
              </div>

              {visibleQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No micro-sprints in this view!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add a task above, switch your energy level, or click &ldquo;Load Judge Demo&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleQueue.map((sprint) => {
                    const isActive = sprint.id === activeSprint?.id;
                    const matchesEnergy = sprint.energyRequired === currentEnergy;
                    return (
                      <div
                        key={sprint.id}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                          isActive
                            ? 'border-amber-400 bg-amber-500/10'
                            : matchesEnergy
                            ? 'border-emerald-500/30 bg-slate-950/80 hover:border-emerald-400/60'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {matchesEnergy && (
                              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                BEST MATCH
                              </span>
                            )}
                            <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                              {sprint.energyRequired} energy
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="h-3 w-3" />
                              {sprint.durationMinutes}m
                            </span>
                          </div>
                          <p className="truncate text-sm font-semibold text-white">
                            {sprint.title}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            From: {sprint.parentTask}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => selectSprint(sprint)}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                              isActive
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-200 hover:bg-amber-400 hover:text-slate-950'
                            }`}
                          >
                            <Play className="h-3.5 w-3.5" />
                            {isActive ? 'Loaded' : 'Focus'}
                          </button>

                          <button
                            onClick={() =>
                              setSprints((prev) => prev.filter((item) => item.id !== sprint.id))
                            }
                            className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition"
                            aria-label="Delete sprint"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {completedSprints.length > 0 && (
                <div className="mt-5 border-t border-slate-800 pt-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Completed Today ({completedSprints.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {completedSprints.slice(-6).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-400 line-through"
                      >
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <SprintTimer
              activeSprint={activeSprint}
              secondsLeft={secondsLeft}
              totalSeconds={totalSeconds}
              isRunning={isRunning}
              currentEnergy={currentEnergy}
              capyFound={settings.capyFound}
              onToggleRun={() => setIsRunning((r) => !r)}
              onReset={() => {
                setIsRunning(false);
                if (activeSprint) {
                  setSecondsLeft(activeSprint.durationMinutes * 60);
                }
              }}
              onAddFiveMinutes={() => {
                setSecondsLeft((s) => s + 300);
                setTotalSeconds((t) => t + 300);
              }}
              onCompleteSprint={handleCompleteSprint}
              onSliceSmaller={handleSliceActiveSmaller}
            />

            <MomentumPanel
              logs={logs}
              dailyGoalMinutes={settings.dailyGoalMinutes}
              onExportReport={handleExportReport}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-5 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <span>Built for Teens Hack Houston Hackathon 2026 • Productivity Theme</span>
          <button
            onClick={handleSecretYuzuClick}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-400 hover:border-amber-400/40 hover:text-amber-300 transition"
            title="Suspiciously chill yuzu leaf..."
          >
            <Leaf className="h-3 w-3 text-emerald-400" />
            {settings.capyFound ? '🍊 Sir Yuzu’s Zen Hot-Spring' : '🍊 Chill Mode v1.0'}
          </button>
        </div>
      </footer>
    </div>
  );
}

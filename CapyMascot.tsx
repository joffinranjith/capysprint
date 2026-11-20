'use client';

import React from 'react';
import { Sparkles, Volume2, VolumeX, X } from 'lucide-react';

interface CapyMascotProps {
  mood: 'chill' | 'focused' | 'celebrating';
  capyFound: boolean;
  zenAudioActive: boolean;
  onToggleZenAudio: () => void;
  onDismissModal?: () => void;
  showUnlockBanner?: boolean;
}

export function CapyIllustration({
  mood = 'chill',
  className = 'w-24 h-24',
}: {
  mood?: 'chill' | 'focused' | 'celebrating';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 140"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sir Yuzu the Capybara"
    >
      <ellipse cx="80" cy="116" rx="66" ry="16" fill="#38BDF8" fillOpacity="0.25" />
      <ellipse cx="80" cy="116" rx="52" ry="10" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M30 88C27 80 33 74 30 66" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M132 84C135 76 129 70 132 62" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M36 112C36 84 52 70 82 70C112 70 126 84 126 112H36Z" fill="#A16207" />
      <rect x="44" y="34" width="72" height="52" rx="24" fill="#B45309" />
      <rect x="64" y="54" width="46" height="30" rx="14" fill="#92400E" />
      <circle cx="52" cy="36" r="8" fill="#78350F" />
      <circle cx="106" cy="36" r="8" fill="#78350F" />

      {mood === 'chill' && (
        <>
          <path d="M58 52Q63 56 68 52" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
          <path d="M92 52Q97 56 102 52" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {mood === 'focused' && (
        <>
          <circle cx="63" cy="51" r="3.5" fill="#1C1917" />
          <circle cx="97" cy="51" r="3.5" fill="#1C1917" />
          <path d="M45 43H115" stroke="#F59E0B" strokeWidth="4" />
        </>
      )}
      {mood === 'celebrating' && (
        <>
          <path d="M58 53L63 48L68 53" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M92 53L97 48L102 53" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      <circle cx="80" cy="64" r="2.2" fill="#451A03" />
      <circle cx="94" cy="64" r="2.2" fill="#451A03" />
      <path d="M87 67V73M81 75Q87 79 93 75" stroke="#451A03" strokeWidth="2.4" strokeLinecap="round" />

      <circle cx="80" cy="25" r="11" fill="#FACC15" />
      <path d="M80 14C84 10 91 11 92 15C88 18 82 17 80 14Z" fill="#22C55E" />
      <circle cx="77" cy="22" r="1.5" fill="#FEF9C3" />
    </svg>
  );
}

export function CapyZenModal({
  mood,
  zenAudioActive,
  onToggleZenAudio,
  onDismissModal,
}: CapyMascotProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {onDismissModal && (
          <button
            onClick={onDismissModal}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close Capybara secret modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          SECRET CRITERIA UNLOCKED: CAPYBARA FOUND!
        </div>

        <div className="flex flex-col items-center text-center">
          <CapyIllustration mood={mood} className="w-36 h-32 my-1" />
          <h3 className="text-xl font-bold text-white mt-1">
            Sir Yuzu’s Hot-Spring Zen Mode
          </h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You discovered the hidden capybara! Unbothered, hydrated, and focused—toggle
            procedural hot-spring waterfall audio while you crush your 15-minute sprints.
          </p>

          <button
            onClick={onToggleZenAudio}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              zenAudioActive
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
            }`}
          >
            {zenAudioActive ? (
              <>
                <Volume2 className="h-4 w-4" />
                Hot-Spring Waterfall Audio: ON (Click to Mute)
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                Activate Hot-Spring Focus Audio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

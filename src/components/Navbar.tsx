import React from 'react';
import { MidiState } from '../services/midiService';
import {
  BookOpen,
  Sparkles,
  Disc,
  Compass,
  Radio,
  Volume2,
  VolumeX,
  Sliders,
  Piano,
} from 'lucide-react';

export type AppMode = 'dictionary' | 'flashcard' | 'progression' | 'circle';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  midiState: MidiState;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  midiState,
  onOpenSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand Identity with Live Pulse Indicator */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full ${midiState.isConnected ? 'bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]' : 'bg-white/30'}`}></div>
            <h1 className="text-base md:text-lg font-bold tracking-wider text-white font-sans flex items-center gap-0.5">
              Khord<span className="text-red-500 font-black">graph</span>
            </h1>
          </div>

          <div
            onClick={onOpenSettings}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] rounded-lg text-[10px] text-white/50 hover:text-white/80 uppercase tracking-widest cursor-pointer transition-all"
          >
            <Radio className="w-3 h-3 text-red-500" />
            <span>
              MIDI: {midiState.isConnected ? (midiState.devices[0]?.name || 'Connected') : 'Waiting / Standby'}
            </span>
          </div>
        </div>

        {/* Center: Numbered Clean Mode Switchers */}
        <nav className="flex items-center gap-2 md:gap-6 bg-[#151518]/90 p-1 md:p-1.5 rounded-xl border border-white/5">
          <button
            id="nav-mode-dictionary-btn"
            onClick={() => onSelectMode('dictionary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentMode === 'dictionary'
                ? 'text-red-400 bg-red-950/40 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>01 辞書 (Dict)</span>
          </button>

          <button
            id="nav-mode-flashcard-btn"
            onClick={() => onSelectMode('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentMode === 'flashcard'
                ? 'text-red-400 bg-red-950/40 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>02 クイズ (Quiz)</span>
          </button>

          <button
            id="nav-mode-progression-btn"
            onClick={() => onSelectMode('progression')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentMode === 'progression'
                ? 'text-red-400 bg-red-950/40 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>03 進行 (Flow)</span>
          </button>

          <button
            id="nav-mode-circle-btn"
            onClick={() => onSelectMode('circle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
              currentMode === 'circle'
                ? 'text-red-400 bg-red-950/40 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>04 五度圏 (5ths)</span>
          </button>
        </nav>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Sound Mute Toggle */}
          <button
            id="toggle-sound-mute-btn"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-[#151518] border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title={isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-white/80" />}
          </button>

          {/* Settings icon */}
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#151518] border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            title="MIDI & サウンド設定"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

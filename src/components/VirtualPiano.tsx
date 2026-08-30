import React, { useEffect, useState, useMemo } from 'react';
import { GeneratedChord, INTERVAL_ROLES, NOTE_NAMES, PitchClass } from '../types/music';
import { midiService } from '../services/midiService';
import { ClefType } from './StaffNotation';
import { Volume2, Keyboard as KeyboardIcon, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface VirtualPianoProps {
  targetChord: GeneratedChord | null;
  activeMidiNotes: number[]; // e.g. [60, 64, 67]
  showGuideHints?: boolean;
  onKeyClick?: (midiNote: number) => void;
  startOctave?: number; // default 3 (MIDI 48) or 2 for bass (MIDI 36)
  octaveCount?: number; // default 3 (36 keys, C3 - B5)
  compact?: boolean;
  clef?: ClefType;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  targetChord,
  activeMidiNotes,
  showGuideHints = true,
  onKeyClick,
  startOctave: propStartOctave,
  octaveCount = 3,
  compact = false,
  clef = 'treble',
}) => {
  const [labelMode, setLabelMode] = useState<'notes' | 'degrees' | 'solfege' | 'keyboard'>('degrees');
  const [guideVisible, setGuideVisible] = useState(showGuideHints);
  const [octaveOffset, setOctaveOffset] = useState<number>(0);

  // Reset offset when clef changes so clef default is applied
  useEffect(() => {
    setOctaveOffset(0);
  }, [clef]);

  const defaultBaseOctave = propStartOctave ?? (clef === 'bass' ? 2 : 3);
  const currentStartOctave = Math.max(1, Math.min(5, defaultBaseOctave + octaveOffset));

  useEffect(() => {
    setGuideVisible(showGuideHints);
  }, [showGuideHints]);

  // Dynamically compute PC keyboard mapping for the center octave
  const keyMap = useMemo<Record<string, number>>(() => {
    // If startOctave is 2 (C2), home center is C3 (MIDI 48).
    // If startOctave is 3 (C3), home center is C4 (MIDI 60).
    const centerC = (currentStartOctave + 1 + 1) * 12; // C3=48 when start=2, C4=60 when start=3
    return {
      a: centerC,      // C
      w: centerC + 1,  // C#
      s: centerC + 2,  // D
      e: centerC + 3,  // D#
      d: centerC + 4,  // E
      f: centerC + 5,  // F
      t: centerC + 6,  // F#
      g: centerC + 7,  // G
      y: centerC + 8,  // G#
      h: centerC + 9,  // A
      u: centerC + 10, // A#
      j: centerC + 11, // B
      k: centerC + 12, // C+1
      o: centerC + 13, // C#+1
      l: centerC + 14, // D+1
      p: centerC + 15, // D#+1
      ';': centerC + 16, // E+1
    };
  }, [currentStartOctave]);

  // Listen to computer keyboard for direct playing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] && !e.repeat) {
        midiService.noteOn(keyMap[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        midiService.noteOff(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyMap]);

  const totalWhiteKeys = octaveCount * 7 + 1; // e.g. 3 * 7 + 1 = 22 white keys
  const startMidi = (currentStartOctave + 1) * 12; // C2: 36, C3: 48

  // Generate piano keys structure
  interface PianoKeyData {
    midi: number;
    pitchClass: PitchClass;
    noteName: string;
    solfege: string;
    octave: number;
    isBlack: boolean;
    whiteIndex: number;
    isTargetNote: boolean;
    role: string | null;
    intervalName: string | null;
    isPressed: boolean;
    keyShortcut?: string;
  }

  const whiteKeys: PianoKeyData[] = [];
  const blackKeys: PianoKeyData[] = [];

  let whiteCounter = 0;
  const isBlackPattern = [false, true, false, true, false, false, true, false, true, false, true, false];

  const totalSemitones = octaveCount * 12 + 1;
  for (let i = 0; i < totalSemitones; i++) {
    const midi = startMidi + i;
    const pc = (midi % 12) as PitchClass;
    const octave = Math.floor(midi / 12) - 1;
    const isBlack = isBlackPattern[pc];
    const noteInfo = NOTE_NAMES[pc];

    // Check if target chord contains this pitch class
    let isTarget = false;
    let role: string | null = null;
    let intervalName: string | null = null;

    if (targetChord && guideVisible) {
      const pcIdx = targetChord.pitchClasses.indexOf(pc);
      if (pcIdx !== -1) {
        isTarget = true;
        role = targetChord.roles[pcIdx] || 'extension';
        intervalName = targetChord.intervalNames[pcIdx] || '';
      }
    }

    const isPressed = activeMidiNotes.includes(midi);

    // Keyboard shortcut lookup
    const shortcutEntry = Object.entries(keyMap).find(([, m]) => m === midi);
    const keyShortcut = shortcutEntry ? shortcutEntry[0].toUpperCase() : undefined;

    const keyData: PianoKeyData = {
      midi,
      pitchClass: pc,
      noteName: noteInfo.name,
      solfege: noteInfo.solfege,
      octave,
      isBlack,
      whiteIndex: isBlack ? whiteCounter - 1 : whiteCounter,
      isTargetNote: isTarget,
      role,
      intervalName,
      isPressed,
      keyShortcut,
    };

    if (isBlack) {
      blackKeys.push(keyData);
    } else {
      whiteKeys.push(keyData);
      whiteCounter++;
    }
  }

  const handleMouseDown = (midi: number) => {
    midiService.noteOn(midi);
    if (onKeyClick) onKeyClick(midi);
  };

  const handleMouseUp = (midi: number) => {
    midiService.noteOff(midi);
  };

  return (
    <div
      className={`w-full bg-[#151518] border border-white/5 rounded-2xl shadow-2xl select-none flex flex-col justify-between ${
        compact ? 'p-2.5 sm:p-3 md:p-3.5' : 'p-3 sm:p-4 md:p-5'
      }`}
    >
      {/* Keyboard Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 pb-2 border-b border-white/5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/80 font-semibold tracking-wide text-[10px] sm:text-[11px]">
            <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-500" />
            <span className="hidden sm:inline">
              37鍵 (C{currentStartOctave} - C{currentStartOctave + octaveCount})
            </span>
            <span className="sm:hidden font-mono">
              C{currentStartOctave}-C{currentStartOctave + octaveCount}
            </span>
            <span className="px-1 py-0.2 text-[9px] rounded bg-red-500/20 text-red-300 font-mono">
              {clef === 'bass' ? '𝄢 ヘ音' : '𝄞 ト音'}
            </span>
          </div>

          {/* Octave shift controls */}
          <div className="flex items-center bg-[#0F0F11] rounded-lg border border-white/10 p-0.5">
            <button
              id="octave-down-btn"
              onClick={() => setOctaveOffset((prev) => Math.max(-2, prev - 1))}
              disabled={currentStartOctave <= 1}
              className="p-1 text-white/50 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
              title="1オクターブ下げる"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-white/70">
              Oct {currentStartOctave}
            </span>
            <button
              id="octave-up-btn"
              onClick={() => setOctaveOffset((prev) => Math.max(-2, Math.min(2, prev + 1)))}
              disabled={currentStartOctave >= 5}
              className="p-1 text-white/50 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
              title="1オクターブ上げる"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <button
            id="toggle-guide-hints-btn"
            onClick={() => setGuideVisible(!guideVisible)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg font-medium text-[10px] sm:text-[11px] transition-all cursor-pointer ${
              guideVisible
                ? 'bg-red-950/40 text-red-300 border border-red-500/40 shadow-sm'
                : 'bg-white/5 text-white/40 hover:text-white border border-white/10'
            }`}
          >
            {guideVisible ? <Eye className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3 text-white/40" />}
            <span>{guideVisible ? 'ガイドON' : 'ガイドOFF'}</span>
          </button>
        </div>

        {/* Label Mode Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-[#0F0F11] p-0.5 rounded-lg border border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
          <button
            id="label-mode-degrees-btn"
            onClick={() => setLabelMode('degrees')}
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider transition-all cursor-pointer shrink-0 ${
              labelMode === 'degrees' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            度数
          </button>
          <button
            id="label-mode-notes-btn"
            onClick={() => setLabelMode('notes')}
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider transition-all cursor-pointer shrink-0 ${
              labelMode === 'notes' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            音名
          </button>
          <button
            id="label-mode-solfege-btn"
            onClick={() => setLabelMode('solfege')}
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider transition-all cursor-pointer shrink-0 ${
              labelMode === 'solfege' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            ドレミ
          </button>
          <button
            id="label-mode-keyboard-btn"
            onClick={() => setLabelMode('keyboard')}
            className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider transition-all cursor-pointer shrink-0 ${
              labelMode === 'keyboard' ? 'bg-red-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
            title="PCキーボード対応キー (A,W,S,E,D...)"
          >
            <KeyboardIcon className="w-2.5 h-2.5" />
            PC
          </button>
        </div>
      </div>

      {/* Interval Role Legend Badges */}
      {guideVisible && targetChord && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-2 px-2 sm:px-2.5 py-1 bg-[#0F0F11] rounded-lg text-xs border border-white/5">
          <span className="text-white/40 font-bold uppercase tracking-widest text-[9px] mr-1">
            Intervals:
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-mono font-bold text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> ルート (Root)
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono font-bold text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 3rd (3度)
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/30 font-mono font-bold text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> 5th (5度)
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 font-mono font-bold text-[9px] sm:text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 7th (7度)
          </span>
          {targetChord.roles.includes('extension') && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold text-[9px] sm:text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> 9th / テンション
            </span>
          )}
        </div>
      )}

      {/* Piano Keyboard Container */}
      <div
        className={`relative w-full ${
          compact ? 'h-28 sm:h-32 md:h-36' : 'h-32 sm:h-36 md:h-44'
        } bg-[#0A0A0B] rounded-xl p-1 overflow-x-auto md:overflow-hidden shadow-2xl border border-white/5 touch-none scrollbar-none`}
      >
        <div className="relative min-w-[540px] sm:min-w-0 w-full h-full flex">
          {/* Render White Keys */}
          {whiteKeys.map((key) => {
            const roleInfo = key.role && INTERVAL_ROLES[key.role] ? INTERVAL_ROLES[key.role] : null;

            let labelText = '';
            if (labelMode === 'degrees') {
              labelText = key.isTargetNote && key.intervalName ? key.intervalName : key.noteName;
            } else if (labelMode === 'notes') {
              labelText = `${key.noteName}${key.octave}`;
            } else if (labelMode === 'solfege') {
              labelText = key.solfege;
            } else if (labelMode === 'keyboard') {
              labelText = key.keyShortcut || key.noteName;
            }

            return (
              <div
                key={`white-key-${key.midi}`}
                id={`piano-key-${key.midi}`}
                onMouseDown={() => handleMouseDown(key.midi)}
                onMouseUp={() => handleMouseUp(key.midi)}
                onMouseLeave={() => key.isPressed && handleMouseUp(key.midi)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMouseDown(key.midi);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleMouseUp(key.midi);
                }}
                className={`relative flex-1 h-full rounded-b-md cursor-pointer transition-all duration-75 border-r border-[#C8C8CC] last:border-r-0 flex flex-col justify-end items-center pb-2 z-10 ${
                  key.isPressed
                    ? 'bg-red-500 text-white scale-y-[0.98] origin-top shadow-[0_0_20px_rgba(239,68,68,0.9),inset_0_-4px_0_#991B1B]'
                    : key.isTargetNote
                    ? 'bg-[#FFFFFF] text-black shadow-[inset_0_-6px_0_#A0A0A5] hover:bg-[#F5F5F7]'
                    : 'bg-[#E0E0E0] text-[#151518] shadow-[inset_0_-6px_0_#B0B0B5] hover:bg-[#ECECED]'
                }`}
              >
                {/* Target Note Highlight Badge on White Key */}
                {key.isTargetNote && (
                  <div
                    className="absolute top-2 w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-lg border-2 border-white animate-bounce-short"
                    style={{
                      backgroundColor: roleInfo ? roleInfo.hexColor : '#EF4444',
                      color: '#ffffff',
                    }}
                  >
                    {key.intervalName || '★'}
                  </div>
                )}

                {/* Pressed indicator ring */}
                {key.isPressed && (
                  <div className="absolute top-10 w-4 h-4 rounded-full bg-white border-2 border-red-600 animate-ping"></div>
                )}

                {/* Bottom Label */}
                <div className="text-center font-bold font-mono text-[11px] md:text-xs">
                  {labelText}
                  {key.noteName === 'C' && (
                    <span className="block text-[9px] font-semibold text-red-600">C{key.octave}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Render Black Keys (Positioned absolutely over white keys) */}
          {blackKeys.map((key) => {
            const roleInfo = key.role && INTERVAL_ROLES[key.role] ? INTERVAL_ROLES[key.role] : null;

            const whiteKeyWidthPercent = 100 / totalWhiteKeys;
            const leftPercent = (key.whiteIndex + 1) * whiteKeyWidthPercent - whiteKeyWidthPercent * 0.35;
            const widthPercent = whiteKeyWidthPercent * 0.7;

            let labelText = '';
            if (labelMode === 'degrees') {
              labelText = key.isTargetNote && key.intervalName ? key.intervalName : key.noteName;
            } else if (labelMode === 'notes') {
              labelText = key.noteName;
            } else if (labelMode === 'solfege') {
              labelText = key.solfege;
            } else if (labelMode === 'keyboard') {
              labelText = key.keyShortcut || '';
            }

            return (
              <div
                key={`black-key-${key.midi}`}
                id={`piano-key-${key.midi}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(key.midi);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleMouseUp(key.midi);
                }}
                onMouseLeave={() => key.isPressed && handleMouseUp(key.midi)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMouseDown(key.midi);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMouseUp(key.midi);
                }}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                className={`absolute top-0 h-[62%] rounded-b-md cursor-pointer transition-all duration-75 flex flex-col justify-end items-center pb-2 z-20 shadow-2xl ${
                  key.isPressed
                    ? 'bg-red-600 text-white scale-y-[0.98] origin-top shadow-[0_0_25px_rgba(239,68,68,1),inset_0_-3px_0_#7F1D1D]'
                    : key.isTargetNote
                    ? 'bg-[#1A1A1C] text-white border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.35),inset_0_-4px_0_#0A0A0B]'
                    : 'bg-[#1A1A1C] text-white/70 hover:bg-[#252528] shadow-[inset_0_-4px_0_#0A0A0B] border-x border-b border-black'
                }`}
              >
                {/* Target Note Highlight Badge on Black Key */}
                {key.isTargetNote && (
                  <div
                    className="absolute top-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg border border-white animate-pulse"
                    style={{
                      backgroundColor: roleInfo ? roleInfo.hexColor : '#EF4444',
                      color: '#ffffff',
                    }}
                  >
                    {key.intervalName || '★'}
                  </div>
                )}

                {/* Pressed indicator ring */}
                {key.isPressed && (
                  <div className="absolute top-8 w-3 h-3 rounded-full bg-white border border-red-600 animate-ping"></div>
                )}

                {/* Black Key Text Label */}
                <span className="font-extrabold font-mono text-[10px] md:text-[11px] leading-tight">
                  {labelText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

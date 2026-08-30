import React, { useState } from 'react';
import {
  CHORD_TYPES,
  ChordTypeDefinition,
  GeneratedChord,
  ROOTS,
  generateChord,
  PitchClass,
  INTERVAL_ROLES,
  getClefOptimizedMidiNotes,
} from '../types/music';
import { audioSynth } from '../services/audioSynth';
import { StaffNotation, ClefType } from './StaffNotation';
import { VirtualPiano } from './VirtualPiano';
import {
  Volume2,
  Music2,
  Sparkles,
  AlertCircle,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ChordDictionaryViewProps {
  selectedChord: GeneratedChord;
  onSelectChord: (chord: GeneratedChord) => void;
  isMatched: boolean;
  activeMidiNotes: number[];
  matchInfo?: {
    isMatch: boolean;
    missingPitchClasses: number[];
    extraPitchClasses: number[];
  };
  clef?: ClefType;
  onClefChange?: (clef: ClefType) => void;
}

export const ChordDictionaryView: React.FC<ChordDictionaryViewProps> = ({
  selectedChord,
  onSelectChord,
  isMatched,
  activeMidiNotes,
  matchInfo,
  clef,
  onClefChange,
}) => {
  const [selectedRoot, setSelectedRoot] = useState<PitchClass>(
    selectedChord.rootIndex as PitchClass
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string>(selectedChord.typeId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inversion, setInversion] = useState<number>(0);

  const handleRootChange = (rootPc: PitchClass) => {
    setSelectedRoot(rootPc);
    const newChord = generateInvertedChord(rootPc, selectedTypeId, inversion);
    onSelectChord(newChord);
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    const newChord = generateInvertedChord(selectedRoot, typeId, inversion);
    onSelectChord(newChord);
  };

  const handleInversionChange = (inv: number) => {
    setInversion(inv);
    const newChord = generateInvertedChord(selectedRoot, selectedTypeId, inv);
    onSelectChord(newChord);
  };

  function generateInvertedChord(
    rootPc: PitchClass,
    typeId: string,
    invIndex: number
  ): GeneratedChord {
    const baseChord = generateChord(rootPc, typeId);
    if (invIndex === 0 || baseChord.midiNotes.length <= 1) return baseChord;

    const newMidi = [...baseChord.midiNotes];
    const effectiveInv = invIndex % newMidi.length;

    for (let i = 0; i < effectiveInv; i++) {
      newMidi[i] += 12;
    }
    newMidi.sort((a, b) => a - b);

    return {
      ...baseChord,
      midiNotes: newMidi,
      fullName:
        effectiveInv > 0
          ? `${baseChord.fullName} (第${effectiveInv}転回形)`
          : baseChord.fullName,
    };
  }

  const filteredTypes = CHORD_TYPES.filter((type) => {
    if (selectedCategory === 'all') return true;
    return type.category === selectedCategory;
  });

  const handlePlayChord = () => {
    audioSynth.playChord(getClefOptimizedMidiNotes(selectedChord, clef), 2.0);
  };

  const handlePlayArpeggio = () => {
    audioSynth.playArpeggio(getClefOptimizedMidiNotes(selectedChord, clef), 0.22);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-3 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Left Panel: 12 Roots + 120 Chord Types Library */}
      <div className="w-full lg:w-5/12 flex flex-col gap-2.5 min-h-0 overflow-y-auto pr-0 lg:pr-1 flex-none lg:flex-1">
        {/* 1. 12 Roots Selector */}
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-3 sm:p-3.5 shadow-xl flex-none">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              01 ルート音 (12 Roots)
            </h3>
            <span className="text-xs text-white/40 font-mono">
              Key of <strong className="text-red-400">{ROOTS[selectedRoot].name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-1 sm:gap-1.5">
            {ROOTS.map((r) => {
              const isSelected = r.pitchClass === selectedRoot;
              return (
                <button
                  key={`root-btn-${r.pitchClass}`}
                  id={`root-select-${r.pitchClass}`}
                  onClick={() => handleRootChange(r.pitchClass)}
                  className={`flex flex-col items-center justify-center py-2 sm:py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-white/40'
                      : 'bg-[#0F0F11] hover:bg-white/5 text-white/70 border border-white/5'
                  }`}
                >
                  <span className="text-xs sm:text-xs font-bold font-mono">{r.name}</span>
                  <span className="text-[9px] opacity-60">{r.solfege}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Chord Types (120 Types) */}
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-3 sm:p-3.5 shadow-xl flex-1 flex flex-col min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 flex-none">
            <h3 className="text-[10px] uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              02 コードタイプ (Chord Library)
            </h3>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-lg border border-white/5 text-[10px] overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedCategory('basic')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'basic'
                    ? 'bg-red-600 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                基本
              </button>
              <button
                onClick={() => setSelectedCategory('seventh')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'seventh'
                    ? 'bg-red-600 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                7th
              </button>
              <button
                onClick={() => setSelectedCategory('altered')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'altered'
                    ? 'bg-red-600 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                dim/aug
              </button>
              <button
                onClick={() => setSelectedCategory('extended')}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'extended'
                    ? 'bg-red-600 text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                add9/テンション
              </button>
            </div>
          </div>

          {/* Types Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto max-h-48 sm:max-h-64 lg:max-h-none flex-1 pr-1">
            {filteredTypes.map((type) => {
              const isSelected = type.id === selectedTypeId;
              return (
                <button
                  key={`chord-type-${type.id}`}
                  id={`type-select-${type.id}`}
                  onClick={() => handleTypeChange(type.id)}
                  className={`flex flex-col items-start p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/60 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
                      : 'bg-[#0F0F11] hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-mono font-bold text-white">
                      {ROOTS[selectedRoot].name}
                      <span className="text-red-400 ml-0.5">{type.symbol || type.name}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 truncate w-full">
                    {type.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inversion Selector */}
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1.5 text-xs flex-none">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-red-500" />
              転回形 (Inversion):
            </span>
            <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-lg border border-white/5 text-[10px] overflow-x-auto">
              {['基本形', '第1転回', '第2転回', '第3転回'].map((label, idx) => {
                if (idx >= selectedChord.midiNotes.length) return null;
                return (
                  <button
                    key={`inv-btn-${idx}`}
                    onClick={() => handleInversionChange(idx)}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      inversion === idx
                        ? 'bg-red-600 text-white'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Active Chord Display Header + Staff Notation + Virtual Piano */}
      <div className="w-full lg:w-7/12 flex flex-col gap-2.5 min-h-0 overflow-y-auto lg:overflow-hidden justify-between flex-1">
        {/* Chord Banner */}
        <div className="bg-[#151518] border border-white/5 rounded-2xl p-3 sm:p-4 shadow-xl flex-none relative overflow-hidden">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                  Active Chord
                </span>
                <span className="px-1.5 py-0.2 rounded border border-white/10 bg-white/[0.03] text-[9px] text-white/60">
                  {selectedChord.typeName}
                </span>
                <span className="text-[10px] text-white/40">
                  印象: <span className="text-white/80">{selectedChord.mood}</span>
                </span>
              </div>

              <div className="flex items-baseline gap-2 sm:gap-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display-serif font-light tracking-wide text-white">
                  {selectedChord.rootName}
                  <span className="text-2xl sm:text-3xl ml-1 font-sans text-red-400">
                    {selectedChord.symbol || selectedChord.typeName}
                  </span>
                </h2>
                <span className="text-xs sm:text-sm font-mono text-white/40">
                  ({selectedChord.rootSolfege} {selectedChord.symbol})
                </span>
              </div>
            </div>

            {/* Right Status & Audio */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {isMatched ? (
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                  <Sparkles className="w-3.5 h-3.5 text-red-400" />
                  <span>正解！MATCH</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-white/40 font-mono text-[10px] border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>MIDI打鍵待機中</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePlayChord}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  <Volume2 className="w-3 h-3" />
                  和音
                </button>
                <button
                  onClick={handlePlayArpeggio}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  <Music2 className="w-3 h-3 text-red-400" />
                  アルペジオ
                </button>
              </div>
            </div>
          </div>

          {/* Constituents Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-xs">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
              構成音:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedChord.pitchClasses.map((pc, idx) => {
                const role = selectedChord.roles[idx] || 'extension';
                const roleInfo = INTERVAL_ROLES[role] || INTERVAL_ROLES.root;
                const noteName = selectedChord.noteNames[idx];
                const interval = selectedChord.intervalNames[idx];
                return (
                  <span
                    key={`const-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0F0F11] border border-white/10 font-mono text-[10px] sm:text-[11px]"
                    style={{ color: roleInfo.hexColor }}
                  >
                    <strong>{noteName}</strong>
                    <span className="text-[9px] opacity-70">({interval})</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Staff Notation (Full Size on Desktop) */}
        <div className="flex-1 min-h-[160px] md:min-h-[200px] flex flex-col justify-center">
          <StaffNotation
            targetChord={selectedChord}
            activeMidiNotes={activeMidiNotes}
            compact={false}
            clef={clef}
            onClefChange={onClefChange}
          />
        </div>

        {/* Virtual Piano (Full Size on Desktop) */}
        <div className="flex-none">
          <VirtualPiano
            targetChord={selectedChord}
            activeMidiNotes={activeMidiNotes}
            showGuideHints={true}
            compact={false}
            clef={clef}
          />
        </div>
      </div>
    </div>
  );
};

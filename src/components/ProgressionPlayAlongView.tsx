import React, { useState, useEffect, useRef } from 'react';
import {
  PROGRESSION_PRESETS,
  ProgressionPreset,
  GeneratedChord,
  INTERVAL_ROLES,
  ROOTS,
  generateChord,
  PitchClass,
  getClefOptimizedMidiNotes,
} from '../types/music';
import { audioSynth } from '../services/audioSynth';
import { StaffNotation, ClefType } from './StaffNotation';
import { VirtualPiano } from './VirtualPiano';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Music,
  CheckCircle2,
  ChevronRight,
  Volume2,
  Layers,
  Flame,
  Clock,
  Settings,
} from 'lucide-react';

interface ProgressionPlayAlongViewProps {
  currentChord: GeneratedChord;
  onSetChord: (chord: GeneratedChord) => void;
  isMatched: boolean;
  onSuccessJingle: () => void;
  activeMidiNotes: number[];
  clef?: ClefType;
  onClefChange?: (clef: ClefType) => void;
}

export const ProgressionPlayAlongView: React.FC<ProgressionPlayAlongViewProps> = ({
  currentChord,
  onSetChord,
  isMatched,
  onSuccessJingle,
  activeMidiNotes,
  clef,
  onClefChange,
}) => {
  const [selectedProgressionId, setSelectedProgressionId] = useState<string>(
    PROGRESSION_PRESETS[0].id
  );
  const [keyRoot, setKeyRoot] = useState<PitchClass>(0); // 0 = C
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playMode, setPlayMode] = useState<'stepByStep' | 'bpmFlow'>('stepByStep'); // stepByStep = wait for user, bpmFlow = timed
  const [isPlayingBpm, setIsPlayingBpm] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(80);
  const [completedLoops, setCompletedLoops] = useState<number>(0);
  const [stepStreak, setStepStreak] = useState<number>(0);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);

  const activeProgression: ProgressionPreset =
    PROGRESSION_PRESETS.find((p) => p.id === selectedProgressionId) ||
    PROGRESSION_PRESETS[0];

  // Generate resolved chord list for this progression in the current key
  const resolvedChords: GeneratedChord[] = activeProgression.steps.map((step) => {
    const rootPc = ((keyRoot + step.rootOffset) % 12) as PitchClass;
    return generateChord(rootPc, step.typeId);
  });

  const activeStepChord = resolvedChords[currentStepIndex] || resolvedChords[0];
  const nextStepChord =
    resolvedChords[(currentStepIndex + 1) % resolvedChords.length];

  // Sync chord to parent state
  useEffect(() => {
    if (activeStepChord) {
      onSetChord(activeStepChord);
    }
  }, [currentStepIndex, keyRoot, selectedProgressionId]);

  // Handle Match in stepByStep mode
  const lastMatchedKey = useRef<string>('');
  useEffect(() => {
    if (isMatched && !isAdvancing) {
      const matchToken = `${selectedProgressionId}_${keyRoot}_${currentStepIndex}_${activeStepChord.id}`;
      if (lastMatchedKey.current !== matchToken) {
        lastMatchedKey.current = matchToken;
        setIsAdvancing(true);
        onSuccessJingle();

        const newStreak = stepStreak + 1;
        setStepStreak(newStreak);

        setTimeout(() => {
          advanceToNextStep();
          setIsAdvancing(false);
        }, 700);
      }
    }
  }, [isMatched, currentStepIndex, selectedProgressionId, keyRoot]);

  const advanceToNextStep = () => {
    setCurrentStepIndex((prev) => {
      const next = prev + 1;
      if (next >= activeProgression.steps.length) {
        setCompletedLoops((c) => c + 1);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
        return 0;
      }
      return next;
    });
  };

  // BPM Auto Metronome Player
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingBpm && playMode === 'bpmFlow') {
      const intervalMs = (60 / bpm) * 4 * 1000; // 4 beats per measure
      timer = setInterval(() => {
        audioSynth.playChord(getClefOptimizedMidiNotes(activeStepChord, clef), 1.2);
        advanceToNextStep();
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingBpm, playMode, bpm, currentStepIndex, activeStepChord, clef]);

  const handleSelectProgression = (id: string) => {
    setSelectedProgressionId(id);
    setCurrentStepIndex(0);
    setIsPlayingBpm(false);
  };

  const handleSelectKey = (root: PitchClass) => {
    setKeyRoot(root);
    setCurrentStepIndex(0);
  };

  const handleResetProgression = () => {
    setCurrentStepIndex(0);
    setCompletedLoops(0);
    setStepStreak(0);
    setIsPlayingBpm(false);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 min-h-0 overflow-hidden">
      {/* Top Controls Bar: Presets & Transposition & Modes */}
      <div className="bg-[#151518] border border-white/5 rounded-2xl px-4 py-3 shadow-xl flex-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Progression Preset Picker */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1">
              <Music className="w-3 h-3 text-red-500" /> 進行プリセット:
            </span>
            <select
              id="progression-preset-select"
              value={selectedProgressionId}
              onChange={(e) => handleSelectProgression(e.target.value)}
              className="bg-[#0F0F11] border border-white/10 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              {PROGRESSION_PRESETS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.japaneseName}
                </option>
              ))}
            </select>
          </div>

          {/* 12 Key Transposition Selector */}
          <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-xl border border-white/5 text-[10px]">
            <span className="text-white/40 font-bold uppercase tracking-wider px-1.5">
              Key:
            </span>
            {ROOTS.map((r) => (
              <button
                key={`key-${r.pitchClass}`}
                onClick={() => handleSelectKey(r.pitchClass)}
                className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  keyRoot === r.pitchClass
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Mode Switch & Stats */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => {
                  setPlayMode('stepByStep');
                  setIsPlayingBpm(false);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  playMode === 'stepByStep'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                ステップ判定 (Wait)
              </button>
              <button
                onClick={() => setPlayMode('bpmFlow')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  playMode === 'bpmFlow'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                メトロノーム (BPM)
              </button>
            </div>

            {playMode === 'bpmFlow' && (
              <div className="flex items-center gap-1.5 bg-[#0F0F11] px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[10px] text-white/40">BPM:</span>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-12 bg-transparent text-white font-mono font-bold text-xs text-center border-b border-white/20 focus:outline-none"
                />
                <button
                  onClick={() => setIsPlayingBpm(!isPlayingBpm)}
                  className={`p-1 rounded cursor-pointer ${
                    isPlayingBpm ? 'bg-red-600 text-white' : 'bg-white/10 text-white'
                  }`}
                >
                  {isPlayingBpm ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
            )}

            {/* Loop Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F0F11] border border-white/5 font-mono text-[11px]">
              <span className="text-white/40">周回:</span>
              <strong className="text-red-400">{completedLoops}</strong>
            </div>

            <button
              onClick={handleResetProgression}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
              title="リセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Progression Flow Visualizer (Left) vs Staff Notation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left: Progression Flow Timeline Cards */}
        <div className="lg:col-span-6 bg-[#151518] border border-white/5 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeProgression.japaneseName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30">
                    Key: {ROOTS[keyRoot].name}
                  </span>
                </h3>
                <p className="text-[11px] text-white/50">{activeProgression.description}</p>
                <p className="text-[10px] text-red-400/80 mt-0.5">
                  代表曲: {activeProgression.famousSongs}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                  進捗 (Progress)
                </span>
                <div className="text-sm font-mono font-bold text-white">
                  <span className="text-red-400">{currentStepIndex + 1}</span> /{' '}
                  {activeProgression.steps.length} 小節
                </div>
              </div>
            </div>

            {/* Current Target Chord Hero Display */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-3 my-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">
                  ▶ 今弾くコード (Now Playing):
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-display-serif font-light text-white">
                    {activeStepChord.rootName}
                    <span className="text-2xl ml-0.5 text-red-400">
                      {activeStepChord.symbol || activeStepChord.typeName}
                    </span>
                  </span>
                  <span className="text-sm font-mono text-white/40">
                    [{activeProgression.steps[currentStepIndex]?.degreeLabel}]
                  </span>
                </div>
                <span className="text-[11px] text-white/60">
                  {activeStepChord.fullName}
                </span>
              </div>

              {/* Next Chord Up Next */}
              <div className="text-right pl-4 border-l border-white/5">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold block">
                  次 (Next):
                </span>
                <span className="text-xl font-display-serif text-white/60">
                  {nextStepChord.rootName}
                  <span className="text-sm ml-0.5 text-white/40">
                    {nextStepChord.symbol || nextStepChord.typeName}
                  </span>
                </span>
                <span className="text-[10px] font-mono text-white/30 block">
                  [{activeProgression.steps[(currentStepIndex + 1) % activeProgression.steps.length]?.degreeLabel}]
                </span>
              </div>
            </div>
          </div>

          {/* Progression Steps Timeline Strip */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
              コード進行シーケンス (Measures):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {resolvedChords.map((chord, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;
                const stepMeta = activeProgression.steps[idx];

                return (
                  <button
                    key={`step-card-${idx}`}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)] ring-1 ring-red-500'
                        : isPast
                        ? 'bg-white/[0.02] border-white/10 opacity-70'
                        : 'bg-[#0F0F11] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={isCurrent ? 'text-red-300 font-bold' : 'text-white/40'}>
                        Bar {idx + 1}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-white/5 font-bold text-white/70 text-[9px]">
                        {stepMeta?.degreeLabel}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white leading-tight">
                      {chord.rootName}
                      <span className="text-red-400 text-sm ml-0.5">
                        {chord.symbol || chord.typeName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback or Next button */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
            {isMatched ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-bounce-short">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>MATCH! 次の小節へ進みます</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>{playMode === 'stepByStep' ? 'この和音を弾いてください' : 'BPMに合わせて演奏'}</span>
              </div>
            )}

            <button
              onClick={() => audioSynth.playChord(getClefOptimizedMidiNotes(activeStepChord, clef), 1.5)}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <Volume2 className="w-3 h-3 text-red-400" /> 試聴
            </button>
          </div>
        </div>

        {/* Right: Staff Notation */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <StaffNotation
            targetChord={activeStepChord}
            activeMidiNotes={activeMidiNotes}
            compact={true}
            clef={clef}
            onClefChange={onClefChange}
          />
        </div>
      </div>

      {/* Bottom: Virtual Piano for this progression chord */}
      <div className="flex-none">
        <VirtualPiano
          targetChord={activeStepChord}
          activeMidiNotes={activeMidiNotes}
          showGuideHints={true}
          compact={true}
          clef={clef}
        />
      </div>
    </div>
  );
};

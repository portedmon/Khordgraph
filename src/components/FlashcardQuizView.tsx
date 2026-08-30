import React, { useState, useEffect, useRef } from 'react';
import {
  ALL_120_CHORDS,
  CHORD_TYPES,
  GeneratedChord,
  generateChord,
  INTERVAL_ROLES,
  getClefOptimizedMidiNotes,
} from '../types/music';
import { audioSynth } from '../services/audioSynth';
import { StaffNotation, ClefType } from './StaffNotation';
import { VirtualPiano } from './VirtualPiano';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Flame,
  Clock,
  RotateCcw,
  SkipForward,
  Filter,
  CheckCircle2,
  Volume2,
} from 'lucide-react';

interface FlashcardQuizViewProps {
  currentChord: GeneratedChord;
  onSetChord: (chord: GeneratedChord) => void;
  isMatched: boolean;
  onSuccessJingle: () => void;
  activeMidiNotes: number[];
  clef?: ClefType;
  onClefChange?: (clef: ClefType) => void;
}

export const FlashcardQuizView: React.FC<FlashcardQuizViewProps> = ({
  currentChord,
  onSetChord,
  isMatched,
  onSuccessJingle,
  activeMidiNotes,
  clef,
  onClefChange,
}) => {
  const [quizPoolType, setQuizPoolType] = useState<
    'all' | 'basic' | 'seventh' | 'advanced'
  >('all');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [autoAdvanceDelay] = useState(0.8);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // Default to test/quiz blind mode

  // Candidate pool
  const getPool = () => {
    let types = CHORD_TYPES;
    if (quizPoolType === 'basic') {
      types = CHORD_TYPES.filter((t) => t.category === 'basic');
    } else if (quizPoolType === 'seventh') {
      types = CHORD_TYPES.filter((t) => t.category === 'seventh');
    } else if (quizPoolType === 'advanced') {
      types = CHORD_TYPES.filter(
        (t) => t.category === 'altered' || t.category === 'extended'
      );
    }

    const pool: GeneratedChord[] = [];
    for (let r = 0; r < 12; r++) {
      types.forEach((t) => pool.push(generateChord(r, t.id)));
    }
    return pool;
  };

  const pickRandomChord = () => {
    const pool = getPool();
    const rand = pool[Math.floor(Math.random() * pool.length)];
    onSetChord(rand);
  };

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Handle Match
  const lastMatchedChordId = useRef<string>('');
  useEffect(() => {
    if (isMatched && currentChord.id !== lastMatchedChordId.current && !isAdvancing) {
      lastMatchedChordId.current = currentChord.id;
      setIsAdvancing(true);

      onSuccessJingle();

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setScore((prev) => prev + 100 + newStreak * 25);
      setQuestionsAnswered((prev) => prev + 1);

      if (newStreak % 5 === 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setTimeout(() => {
        pickRandomChord();
        setIsAdvancing(false);
      }, autoAdvanceDelay * 1000);
    }
  }, [isMatched, currentChord.id]);

  const handleSkip = () => {
    setStreak(0);
    pickRandomChord();
  };

  const handleResetStats = () => {
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setTimerSeconds(0);
    pickRandomChord();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 min-h-0 overflow-hidden">
      {/* Top Quiz Score & Controls Bar */}
      <div className="bg-[#151518] border border-white/5 rounded-2xl px-4 py-3 shadow-xl flex-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-xl border border-white/5 text-xs">
            <span className="text-white/40 font-bold uppercase tracking-widest text-[9px] px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-red-500" /> 出題範囲:
            </span>
            {(
              [
                ['all', '全120種'],
                ['basic', '基本三和音'],
                ['seventh', '7th'],
                ['advanced', 'テンション'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setQuizPoolType(key);
                  pickRandomChord();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  quizPoolType === key
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Score, Streak & Timer Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0F0F11] border border-white/5 font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-white/40 text-[10px]">STREAK:</span>
              <span className="font-extrabold text-amber-400 text-sm">{streak}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0F0F11] border border-white/5 font-mono">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-white/40 text-[10px]">SCORE:</span>
              <span className="font-extrabold text-white text-sm">{score}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0F0F11] border border-white/5 font-mono">
              <Clock className="w-3.5 h-3.5 text-white/40" />
              <span className="font-bold text-white/70">{formatTime(timerSeconds)}</span>
            </div>

            <button
              id="skip-quiz-question-btn"
              onClick={handleSkip}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
            >
              <SkipForward className="w-3 h-3" /> スキップ
            </button>

            <button
              onClick={handleResetStats}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
              title="リセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Question Card (Left) vs Staff Notation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left: Giant Mystery Question Card */}
        <div className="lg:col-span-5 bg-[#151518] border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                  第 {questionsAnswered + 1} 問
                </span>
                <span className="text-[10px] text-white/40">{currentChord.typeName}</span>
              </div>
              <span className="text-[10px] text-white/40">
                最高連続: <strong className="text-amber-400 font-mono">{bestStreak}</strong>
              </span>
            </div>

            <div className="my-2">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                弾いてみよう！ (Play this chord):
              </span>
              <div className="flex items-baseline gap-3 my-1">
                <h2 className="text-5xl md:text-6xl font-display-serif font-light tracking-wide text-white">
                  {currentChord.rootName}
                  <span className="text-3xl md:text-4xl ml-1 font-sans text-red-400">
                    {currentChord.symbol || currentChord.typeName}
                  </span>
                </h2>
                <span className="text-lg font-mono text-white/40">
                  ({currentChord.rootSolfege} {currentChord.symbol})
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                {currentChord.description}
              </p>
            </div>
          </div>

          {/* Feedback Banner or Hint */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            {isMatched ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-bounce-short">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>EXCELLENT! 正解です！</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>鍵盤またはMIDIで和音を弾いてください</span>
              </div>
            )}

            <button
              onClick={() => audioSynth.playChord(getClefOptimizedMidiNotes(currentChord, clef), 1.8)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-400" />
              正解音を聴く
            </button>
          </div>
        </div>

        {/* Right: Staff Notation */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <StaffNotation
            targetChord={currentChord}
            activeMidiNotes={activeMidiNotes}
            compact={true}
            clef={clef}
            onClefChange={onClefChange}
          />
        </div>
      </div>

      {/* Bottom: Virtual Piano with Test Mode */}
      <div className="flex-none">
        <VirtualPiano
          targetChord={currentChord}
          activeMidiNotes={activeMidiNotes}
          showGuideHints={showGuide}
          compact={true}
          clef={clef}
        />
      </div>
    </div>
  );
};

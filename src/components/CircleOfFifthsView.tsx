import React, { useState, useEffect, useRef } from 'react';
import {
  CIRCLE_OF_FIFTHS,
  CircleKeyData,
  GeneratedChord,
  generateChord,
  PitchClass,
} from '../types/music';
import { audioSynth } from '../services/audioSynth';
import { StaffNotation, ClefType } from './StaffNotation';
import { VirtualPiano } from './VirtualPiano';
import confetti from 'canvas-confetti';
import {
  Compass,
  RotateCw,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Volume2,
} from 'lucide-react';

interface CircleOfFifthsViewProps {
  currentChord: GeneratedChord;
  onSetChord: (chord: GeneratedChord) => void;
  isMatched: boolean;
  onSuccessJingle: () => void;
  activeMidiNotes: number[];
  clef?: ClefType;
  onClefChange?: (clef: ClefType) => void;
}

export const CircleOfFifthsView: React.FC<CircleOfFifthsViewProps> = ({
  currentChord,
  onSetChord,
  isMatched,
  onSuccessJingle,
  activeMidiNotes,
  clef,
  onClefChange,
}) => {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);
  const [drillMode, setDrillMode] = useState<
    'explore' | 'clockwise' | 'counterClockwise' | 'twoFiveCycle'
  >('explore');
  const [cycleStep, setCycleStep] = useState<number>(0);
  const [drillChordsList, setDrillChordsList] = useState<GeneratedChord[]>([]);
  const [completedDrills, setCompletedDrills] = useState<number>(0);

  const activeKey = CIRCLE_OF_FIFTHS[selectedKeyIndex];

  // Initialize or change drill sequence
  useEffect(() => {
    let chords: GeneratedChord[] = [];

    if (drillMode === 'clockwise') {
      chords = CIRCLE_OF_FIFTHS.map((k) => generateChord(k.pitchClass, 'maj7'));
    } else if (drillMode === 'counterClockwise') {
      const reversed = [CIRCLE_OF_FIFTHS[0], ...CIRCLE_OF_FIFTHS.slice(1).reverse()];
      chords = reversed.map((k) => generateChord(k.pitchClass, 'maj7'));
    } else if (drillMode === 'twoFiveCycle') {
      const circleOrder = [CIRCLE_OF_FIFTHS[0], ...CIRCLE_OF_FIFTHS.slice(1).reverse()];
      circleOrder.forEach((k) => {
        const root = k.pitchClass;
        chords.push(generateChord(((root + 2) % 12) as PitchClass, 'm7'));
        chords.push(generateChord(((root + 7) % 12) as PitchClass, '7'));
        chords.push(generateChord(root, 'maj7'));
      });
    }

    setDrillChordsList(chords);
    setCycleStep(0);
    if (drillMode !== 'explore' && chords.length > 0) {
      onSetChord(chords[0]);
    }
  }, [drillMode]);

  // Handle chord matching in drills
  const lastMatchedKey = useRef<string>('');
  useEffect(() => {
    if (drillMode !== 'explore' && isMatched && drillChordsList.length > 0) {
      const matchKey = `${drillMode}_${cycleStep}_${currentChord.id}`;
      if (lastMatchedKey.current !== matchKey) {
        lastMatchedKey.current = matchKey;
        onSuccessJingle();

        setTimeout(() => {
          advanceDrillStep();
        }, 500);
      }
    }
  }, [isMatched, cycleStep, drillMode, currentChord.id, drillChordsList.length]);

  const advanceDrillStep = () => {
    setCycleStep((prev) => {
      const next = prev + 1;
      if (next >= drillChordsList.length) {
        setCompletedDrills((c) => c + 1);
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

  useEffect(() => {
    if (drillMode !== 'explore' && drillChordsList[cycleStep]) {
      onSetChord(drillChordsList[cycleStep]);
      const targetPc = drillChordsList[cycleStep].rootIndex;
      const keyIdx = CIRCLE_OF_FIFTHS.findIndex((k) => k.pitchClass === targetPc);
      if (keyIdx !== -1) setSelectedKeyIndex(keyIdx);
    }
  }, [cycleStep, drillChordsList, drillMode]);

  const handleSelectKey = (idx: number) => {
    setSelectedKeyIndex(idx);
    const key = CIRCLE_OF_FIFTHS[idx];
    onSetChord(generateChord(key.pitchClass, 'maj'));
  };

  const handleSelectDiatonicChord = (chord: GeneratedChord) => {
    onSetChord(chord);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Top Controls: Drill Mode Switcher */}
      <div className="bg-[#151518] border border-white/5 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl flex-none">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-white tracking-wide">
              五度圏 (Circle of Fifths)
            </h3>
          </div>

          {/* Drill Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-xl border border-white/5 text-xs overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
            <button
              onClick={() => setDrillMode('explore')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                drillMode === 'explore'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              探索
            </button>
            <button
              onClick={() => setDrillMode('clockwise')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                drillMode === 'clockwise'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <RotateCw className="w-3 h-3" /> 5度順 (時計回り)
            </button>
            <button
              onClick={() => setDrillMode('counterClockwise')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                drillMode === 'counterClockwise'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3 h-3" /> 4度順 (強進行)
            </button>
            <button
              onClick={() => setDrillMode('twoFiveCycle')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                drillMode === 'twoFiveCycle'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              II-V-I サイクル
            </button>
          </div>

          {drillMode !== 'explore' && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-white/40">Step:</span>
              <strong className="text-red-400">
                {cycleStep + 1} / {drillChordsList.length}
              </strong>
              <span className="text-white/40 ml-2">周回:</span>
              <strong className="text-white">{completedDrills}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Circle Radial Map + Diatonic Chords & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Circle Wheel */}
        <div className="lg:col-span-5 bg-[#151518] border border-white/5 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden flex-none lg:flex-auto">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Background circular rings */}
              <circle
                cx="150"
                cy="150"
                r="135"
                fill="#0A0A0B"
                stroke="#27272A"
                strokeWidth="1.5"
              />
              <circle
                cx="150"
                cy="150"
                r="88"
                fill="#151518"
                stroke="#27272A"
                strokeWidth="1.5"
              />
              <circle cx="150" cy="150" r="48" fill="#0A0A0B" />

              {/* 12 Key Wedges */}
              {CIRCLE_OF_FIFTHS.map((key, i) => {
                const angleDeg = i * 30 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const isSelected = i === selectedKeyIndex;

                const rMajor = 112;
                const xMaj = 150 + rMajor * Math.cos(angleRad);
                const yMaj = 150 + rMajor * Math.sin(angleRad);

                const rMinor = 68;
                const xMin = 150 + rMinor * Math.cos(angleRad);
                const yMin = 150 + rMinor * Math.sin(angleRad);

                return (
                  <g
                    key={`circle-key-${i}`}
                    onClick={() => handleSelectKey(i)}
                    className="cursor-pointer transition-all duration-150"
                  >
                    {/* Active highlight pill */}
                    {isSelected && (
                      <circle
                        cx={xMaj}
                        cy={yMaj}
                        r="20"
                        fill="#DC2626"
                        className="animate-pulse shadow-lg"
                      />
                    )}

                    {/* Major Key Label */}
                    <text
                      x={xMaj}
                      y={yMaj + 5}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#E4E4E7'}
                      fontSize={isSelected ? '14' : '12'}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {key.majorName}
                    </text>

                    {/* Minor Key Label */}
                    <text
                      x={xMin}
                      y={yMin + 3.5}
                      textAnchor="middle"
                      fill={isSelected ? '#FCA5A5' : '#71717A'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {key.minorName}
                    </text>
                  </g>
                );
              })}

              {/* Center Key Info */}
              <text
                x="150"
                y="145"
                textAnchor="middle"
                fill="#EF4444"
                fontSize="16"
                fontWeight="900"
              >
                {activeKey.majorName}
              </text>
              <text
                x="150"
                y="160"
                textAnchor="middle"
                fill="#71717A"
                fontSize="9"
                fontFamily="sans-serif"
              >
                {activeKey.signatureText}
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Diatonic Chords & Staff */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-2.5 min-h-0">
          {/* Diatonic Chords Grid */}
          <div className="bg-[#151518] border border-white/5 rounded-2xl p-3 sm:p-3.5 shadow-xl flex-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-red-500" />
                {activeKey.majorName} Major ダイアトニックコード:
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {activeKey.diatonicChords.map((dItem, idx) => {
                const isCurrent = currentChord.id === dItem.chord.id;

                return (
                  <button
                    key={`diatonic-${idx}`}
                    onClick={() => handleSelectDiatonicChord(dItem.chord)}
                    className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      isCurrent
                        ? 'bg-red-600 text-white font-bold border-white/30 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'bg-[#0F0F11] hover:bg-white/5 text-white/70 border-white/5'
                    }`}
                  >
                    <span className="text-[9px] opacity-60 font-mono">{dItem.degree}</span>
                    <span className="text-xs font-bold font-mono mt-0.5">
                      {dItem.chord.fullName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff Notation */}
          <div className="flex-1 min-h-[160px] md:min-h-[200px] flex flex-col justify-center">
            <StaffNotation
              targetChord={currentChord}
              activeMidiNotes={activeMidiNotes}
              compact={false}
              clef={clef}
              onClefChange={onClefChange}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Virtual Piano */}
      <div className="flex-none">
        <VirtualPiano
          targetChord={currentChord}
          activeMidiNotes={activeMidiNotes}
          showGuideHints={true}
          compact={false}
          clef={clef}
        />
      </div>
    </div>
  );
};

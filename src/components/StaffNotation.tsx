import React, { useState } from 'react';
import { GeneratedChord, INTERVAL_ROLES, PitchClass } from '../types/music';

export type ClefType = 'treble' | 'bass';

interface StaffNotationProps {
  targetChord: GeneratedChord;
  activeMidiNotes: number[]; // e.g. [60, 64, 67, 71]
  looseMatch?: boolean;
  compact?: boolean;
  clef?: ClefType;
  onClefChange?: (clef: ClefType) => void;
}

// Diatonic position & accidental calculation for musical staff rendering
interface DiatonicPosition {
  diatonicStep: number; // 0 for C4 (Middle C), 1 for D4, 2 for E4... -7 for C3, -10 for G2, etc.
  accidental: '' | '#' | 'b';
  pitchClass: PitchClass;
  noteName: string;
}

function midiToDiatonic(midi: number): DiatonicPosition {
  const octave = Math.floor(midi / 12) - 1; // e.g. 60/12 - 1 = 4 (C4)
  const pc = (midi % 12) as PitchClass;

  const diatonicMap: Record<PitchClass, { step: number; acc: '' | '#' | 'b'; name: string }> = {
    0: { step: 0, acc: '', name: 'C' },
    1: { step: 0, acc: '#', name: 'C#' },
    2: { step: 1, acc: '', name: 'D' },
    3: { step: 2, acc: 'b', name: 'E♭' },
    4: { step: 2, acc: '', name: 'E' },
    5: { step: 3, acc: '', name: 'F' },
    6: { step: 3, acc: '#', name: 'F#' },
    7: { step: 4, acc: '', name: 'G' },
    8: { step: 4, acc: '#', name: 'G#' },
    9: { step: 5, acc: '', name: 'A' },
    10: { step: 6, acc: 'b', name: 'B♭' },
    11: { step: 6, acc: '', name: 'B' },
  };

  const info = diatonicMap[pc];
  const totalStep = (octave - 4) * 7 + info.step;

  return {
    diatonicStep: totalStep,
    accidental: info.acc,
    pitchClass: pc,
    noteName: `${info.name}${octave}`,
  };
}

export const StaffNotation: React.FC<StaffNotationProps> = ({
  targetChord,
  activeMidiNotes,
  compact = false,
  clef: propClef,
  onClefChange,
}) => {
  const [internalClef, setInternalClef] = useState<ClefType>('treble');
  const currentClef = propClef ?? internalClef;

  const handleSetClef = (clef: ClefType) => {
    setInternalClef(clef);
    if (onClefChange) {
      onClefChange(clef);
    }
  };

  // Staff geometry:
  // 5 lines at y = 35, 45, 55, 65, 75 (step per diatonic note = 5px)
  // Treble Clef (ト音記号):
  // - C4 (step 0) is at y = 85 (1 ledger line below bottom line E4 at y=75)
  // - Formula: y = 85 - diatonicStep * 5
  // Bass Clef (ヘ音記号):
  // - C4 (step 0) is at y = 25 (1 ledger line above top line A3 at y=35)
  // - 4th line (y = 45) is F3 (step -4 -> 25 - (-4)*5 = 45)
  // - Bottom line (y = 75) is G2 (step -10 -> 25 - (-10)*5 = 75)
  // - Formula: y = 25 - diatonicStep * 5
  const stepToY = (step: number) => {
    if (currentClef === 'bass') {
      return 25 - step * 5;
    }
    return 85 - step * 5;
  };

  // Helper to compute all needed ledger lines for a given note Y
  const getLedgerLines = (noteY: number): number[] => {
    const lines: number[] = [];
    if (noteY >= 85) {
      for (let ly = 85; ly <= noteY + 1; ly += 10) {
        lines.push(ly);
      }
    } else if (noteY <= 25) {
      for (let ly = 25; ly >= noteY - 1; ly -= 10) {
        lines.push(ly);
      }
    }
    return lines;
  };

  const clefOctaveShift = currentClef === 'bass' ? -12 : 0;
  const effectiveTargetMidiNotes = targetChord.midiNotes.map((midi) => midi + clefOctaveShift);

  const targetNotesData = effectiveTargetMidiNotes.map((midi, idx) => {
    const diatonic = midiToDiatonic(midi);
    const role = targetChord.roles[idx] || 'extension';
    const intervalRole = INTERVAL_ROLES[role] || INTERVAL_ROLES.root;
    const noteY = stepToY(diatonic.diatonicStep);
    return {
      midi,
      diatonic,
      y: noteY,
      ledgerLines: getLedgerLines(noteY),
      role,
      intervalName: targetChord.intervalNames[idx] || '•',
      color: intervalRole.hexColor,
    };
  });

  const playedNotesData = activeMidiNotes.map((midi) => {
    const diatonic = midiToDiatonic(midi);
    const isTarget = targetChord.pitchClasses.includes(diatonic.pitchClass);
    const targetIdx = targetChord.pitchClasses.indexOf(diatonic.pitchClass);
    const role = isTarget && targetIdx >= 0 ? targetChord.roles[targetIdx] : null;
    const color =
      role && INTERVAL_ROLES[role]
        ? INTERVAL_ROLES[role].hexColor
        : isTarget
        ? '#10b981'
        : '#f59e0b';
    const noteY = stepToY(diatonic.diatonicStep);
    return {
      midi,
      diatonic,
      y: noteY,
      ledgerLines: getLedgerLines(noteY),
      isTarget,
      color,
    };
  });

  return (
    <div
      className={`w-full bg-[#151518] border border-white/5 rounded-2xl shadow-xl backdrop-blur select-none flex flex-col justify-between ${
        compact ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4 md:p-5'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
            <h3 className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/60 font-bold font-mono">
              五線譜リアルタイム対照 (Staff Notation)
            </h3>
          </div>

          {/* Clef Switcher (ト音記号 / ヘ音記号) */}
          <div className="flex items-center gap-1 bg-[#0B0B0D] p-0.5 rounded-lg border border-white/10 text-xs">
            <button
              id="clef-treble-btn"
              onClick={() => handleSetClef('treble')}
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentClef === 'treble'
                  ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'text-white/40 hover:text-white'
              }`}
              title="ト音記号 (Treble Clef / G Clef)"
            >
              <span className="text-xs sm:text-sm">𝄞</span>
              <span>ト音記号</span>
            </button>
            <button
              id="clef-bass-btn"
              onClick={() => handleSetClef('bass')}
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentClef === 'bass'
                  ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'text-white/40 hover:text-white'
              }`}
              title="ヘ音記号 (Bass Clef / F Clef)"
            >
              <span className="text-xs sm:text-sm">𝄢</span>
              <span>ヘ音記号</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5 text-white/70 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            出題 (Target)
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            打鍵 (Played)
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto rounded-xl bg-[#0B0B0D] border border-white/[0.05] p-2 flex items-center justify-center">
        <svg
          viewBox="0 0 740 145"
          className={`w-full ${compact ? 'h-28 sm:h-32 md:h-36' : 'h-32 sm:h-40 md:h-48 lg:h-52 xl:h-56'} select-none`}
          style={{ minWidth: '460px' }}
        >
          {/* Section Panels */}
          <rect
            x="170"
            y="8"
            width="265"
            height="130"
            rx="6"
            fill="#121215"
            stroke="#ffffff"
            strokeOpacity="0.04"
            strokeWidth="1"
          />
          <rect
            x="455"
            y="8"
            width="265"
            height="130"
            rx="6"
            fill="#121215"
            stroke="#ffffff"
            strokeOpacity="0.04"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Section Header Text */}
          <text
            x="302"
            y="22"
            textAnchor="middle"
            fill="#A1A1AA"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.06em"
          >
            出題和音: {targetChord.fullName}
          </text>
          <text
            x="587"
            y="22"
            textAnchor="middle"
            fill={playedNotesData.length > 0 ? '#4ADE80' : '#71717A'}
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.06em"
          >
            {playedNotesData.length > 0
              ? `打鍵検出: ${playedNotesData.length}音`
              : 'MIDI / 鍵盤を入力してください'}
          </text>

          {/* Staff 5 Lines (y = 35, 45, 55, 65, 75) */}
          {[35, 45, 55, 65, 75].map((y, i) => (
            <line
              key={`line-${i}`}
              x1="25"
              y1={y}
              x2="725"
              y2={y}
              stroke="#2E2E34"
              strokeWidth="1.2"
            />
          ))}

          {/* Clef (Treble G-Clef / Bass F-Clef) */}
          {currentClef === 'treble' ? (
            <g transform="translate(36, 18) scale(0.64)">
              <path
                d="M18.5,74.5 C17.3,73.8 15.6,71.2 15.6,67.6 C15.6,61.4 20.2,56.5 25.8,56.5 C31.3,56.5 35.8,61.1 35.8,67.2 C35.8,75.1 28.5,81.2 20.3,81.2 C12.6,81.2 6.5,75.3 6.5,66.4 C6.5,54.8 17.5,41.9 27.2,27.8 C30.6,22.8 33.1,17.4 33.1,11.5 C33.1,4.7 28.8,0 23.3,0 C17.9,0 14.8,4.1 14.8,9.5 C14.8,15.2 18.2,19.2 22.8,19.2 C24.7,19.2 26.2,18.4 27.2,17.1 C25.8,20.8 23.1,25.9 20.5,30.3 C11.8,44.9 3.2,58.7 3.2,70.5 C3.2,85.2 14.8,94.5 27.6,94.5 C40.2,94.5 50.2,83.8 50.2,69.5 C50.2,53.2 38.3,42.5 26.3,42.5 C24.8,42.5 23.4,42.7 22.1,43.2 L25.5,23.5 C28.8,21.5 32.5,16.8 32.5,10.2 C32.5,3.8 28.1,0.5 23.1,0.5 C16.5,0.5 12.5,6.2 12.5,13.2 C12.5,20.1 16.5,25.2 20.1,28.8 L18.5,74.5 Z"
                fill="#9CA3AF"
              />
            </g>
          ) : (
            <g transform="translate(40, 33)">
              {/* Bass Clef Spiral Body */}
              <path
                d="M10,12 C10,15 7.5,17.5 4.5,17.5 C1.5,17.5 0,15 0,12 C0,9 2,6.5 5,6.5 C6.5,6.5 8,7.3 9,8.5 C9.8,5.2 13.5,1 21,1 C30.5,1 36.5,9.5 36.5,20 C36.5,31 27,41 12,46 L10.5,42.5 C23,38 31.5,29.5 31.5,20 C31.5,12 26.5,6 21,6 C15.5,6 11.5,9.5 10,12 Z"
                fill="#9CA3AF"
              />
              {/* Upper Dot (Space 4, y=40) */}
              <circle cx="44" cy="7" r="3.2" fill="#9CA3AF" />
              {/* Lower Dot (Space 3, y=50) */}
              <circle cx="44" cy="17" r="3.2" fill="#9CA3AF" />
            </g>
          )}

          {/* Measure bar lines */}
          <line x1="160" y1="35" x2="160" y2="75" stroke="#44444C" strokeWidth="1.5" />
          <line
            x1="445"
            y1="35"
            x2="445"
            y2="75"
            stroke="#44444C"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <line x1="725" y1="35" x2="725" y2="75" stroke="#44444C" strokeWidth="2" />

          {/* ================= TARGET CHORD NOTES (Left Group, x ~ 300) ================= */}
          <g transform="translate(300, 0)">
            {targetNotesData.map((note, idx) => {
              const hasCollision =
                idx > 0 && Math.abs(targetNotesData[idx - 1].y - note.y) <= 5;
              const noteX = hasCollision ? 14 : 0;

              return (
                <g key={`target-note-${idx}`}>
                  {/* Dynamic Ledger lines */}
                  {note.ledgerLines.map((ly) => (
                    <line
                      key={`ledger-${idx}-${ly}`}
                      x1={noteX - 14}
                      y1={ly}
                      x2={noteX + 14}
                      y2={ly}
                      stroke="#8E8E98"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Accidental */}
                  {note.diatonic.accidental === '#' && (
                    <text
                      x={noteX - 16}
                      y={note.y + 4}
                      fill={note.color}
                      fontSize="13"
                      fontWeight="bold"
                    >
                      ♯
                    </text>
                  )}
                  {note.diatonic.accidental === 'b' && (
                    <text
                      x={noteX - 15}
                      y={note.y + 3}
                      fill={note.color}
                      fontSize="13"
                      fontWeight="bold"
                    >
                      ♭
                    </text>
                  )}

                  {/* Whole Notehead */}
                  <ellipse
                    cx={noteX}
                    cy={note.y}
                    rx="7.5"
                    ry="5.5"
                    transform={`rotate(-20 ${noteX} ${note.y})`}
                    fill={note.color}
                    fillOpacity="0.9"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow-md transition-all duration-200"
                  />

                  {/* Inner oval for semibreve / whole note clarity */}
                  <ellipse
                    cx={noteX}
                    cy={note.y}
                    rx="3.5"
                    ry="2.2"
                    transform={`rotate(-40 ${noteX} ${note.y})`}
                    fill="#121215"
                  />

                  {/* Degree badge tag next to note */}
                  <g transform={`translate(${noteX + 16}, ${note.y + 3})`}>
                    <rect
                      x="0"
                      y="-7"
                      width="42"
                      height="13"
                      rx="3"
                      fill="#0B0B0D"
                      fillOpacity="0.9"
                      stroke={note.color}
                      strokeWidth="1"
                    />
                    <text
                      x="21"
                      y="2.5"
                      textAnchor="middle"
                      fill={note.color}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {note.diatonic.noteName} ({note.intervalName})
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* ================= PLAYED NOTES (Right Group, x ~ 585) ================= */}
          <g transform="translate(585, 0)">
            {playedNotesData.length === 0 ? (
              <g opacity="0.4">
                <ellipse
                  cx="0"
                  cy="55"
                  rx="9"
                  ry="6"
                  fill="none"
                  stroke="#555560"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <line
                  x1="8"
                  y1="55"
                  x2="8"
                  y2="25"
                  stroke="#555560"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text x="0" y="105" textAnchor="middle" fill="#71717A" fontSize="10">
                  (鍵盤入力待ち)
                </text>
              </g>
            ) : (
              playedNotesData.map((note, idx) => {
                const hasCollision =
                  idx > 0 && Math.abs(playedNotesData[idx - 1].y - note.y) <= 5;
                const noteX = hasCollision ? 14 : 0;

                return (
                  <g
                    key={`played-note-${idx}`}
                    className="animate-in fade-in zoom-in-75 duration-100"
                  >
                    {/* Dynamic Ledger lines */}
                    {note.ledgerLines.map((ly) => (
                      <line
                        key={`played-ledger-${idx}-${ly}`}
                        x1={noteX - 14}
                        y1={ly}
                        x2={noteX + 14}
                        y2={ly}
                        stroke="#8E8E98"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Accidental */}
                    {note.diatonic.accidental === '#' && (
                      <text
                        x={noteX - 16}
                        y={note.y + 4}
                        fill={note.color}
                        fontSize="13"
                        fontWeight="bold"
                      >
                        ♯
                      </text>
                    )}
                    {note.diatonic.accidental === 'b' && (
                      <text
                        x={noteX - 15}
                        y={note.y + 3}
                        fill={note.color}
                        fontSize="13"
                        fontWeight="bold"
                      >
                        ♭
                      </text>
                    )}

                    {/* Glowing active notehead */}
                    <ellipse
                      cx={noteX}
                      cy={note.y}
                      rx="7.5"
                      ry="5.5"
                      transform={`rotate(-20 ${noteX} ${note.y})`}
                      fill={note.color}
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                    />

                    {/* Stem */}
                    <line
                      x1={noteX + 6.5}
                      y1={note.y}
                      x2={noteX + 6.5}
                      y2={note.y - 25}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />

                    {/* Note Tag */}
                    <g transform={`translate(${noteX + 16}, ${note.y + 3})`}>
                      <rect
                        x="0"
                        y="-7"
                        width="36"
                        height="13"
                        rx="3"
                        fill={note.isTarget ? '#064e3b' : '#78350f'}
                        stroke={note.color}
                        strokeWidth="1"
                      />
                      <text
                        x="18"
                        y="2.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {note.diatonic.noteName}
                      </text>
                    </g>
                  </g>
                );
              })
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

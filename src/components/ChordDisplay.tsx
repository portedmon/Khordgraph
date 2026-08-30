import React from 'react';
import { GeneratedChord, INTERVAL_ROLES } from '../types/music';
import { audioSynth } from '../services/audioSynth';
import { Volume2, Music2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface ChordDisplayProps {
  chord: GeneratedChord;
  isMatched?: boolean;
  matchInfo?: {
    isMatch: boolean;
    missingPitchClasses: number[];
    extraPitchClasses: number[];
  };
}

export const ChordDisplay: React.FC<ChordDisplayProps> = ({ chord, isMatched = false, matchInfo }) => {
  const handlePlayChord = () => {
    audioSynth.playChord(chord.midiNotes, 2.0);
  };

  const handlePlayArpeggio = () => {
    audioSynth.playArpeggio(chord.midiNotes, 0.22);
  };

  return (
    <div className="w-full bg-[#151518] border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Glow on Match */}
      {isMatched && (
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse"></div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left: Giant Chord Name & Type */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Current Target Chord
            </span>
            <span className="px-2 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[10px] text-white/60 uppercase tracking-wider">
              {chord.typeName}
            </span>
            <span className="text-xs text-white/40 font-medium">
              印象: <span className="text-white/80">{chord.mood}</span>
            </span>
          </div>

          {/* Super Big Chord Title in Sophisticated Serif */}
          <div className="flex items-baseline gap-4 flex-wrap my-1">
            <h1 className="text-6xl md:text-7xl font-display-serif font-light tracking-wide text-white drop-shadow-md">
              {chord.rootName}
              <span className="text-3xl md:text-4xl align-top ml-1 text-white/90 font-sans font-normal">
                {chord.symbol || chord.typeName}
              </span>
            </h1>
            <span className="text-lg md:text-xl font-mono text-white/40">
              ({chord.rootSolfege} {chord.symbol})
            </span>
          </div>

          <p className="text-xs md:text-sm text-white/60 max-w-xl leading-relaxed">
            {chord.description}
          </p>
        </div>

        {/* Right: Actions & Real-Time Status Badge */}
        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          {/* Real-time Match Status */}
          {isMatched ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 font-bold text-xs md:text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-bounce-short">
              <Sparkles className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="tracking-wider uppercase">正解！マッチ (MATCH)</span>
            </div>
          ) : matchInfo && matchInfo.missingPitchClasses.length > 0 && matchInfo.missingPitchClasses.length < chord.pitchClasses.length ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-semibold text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
              <span>あと {matchInfo.missingPitchClasses.length} 音足りません</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-white/40 font-mono text-xs border border-white/5">
              <span className="w-2 h-2 rounded-full bg-red-500/80 animate-ping"></span>
              <span className="tracking-widest uppercase">MIDI打鍵待機中...</span>
            </div>
          )}

          {/* Audio Preview Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              id="play-chord-audio-btn"
              onClick={handlePlayChord}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs md:text-sm shadow-md transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              和音を聴く
            </button>
            <button
              id="play-arpeggio-audio-btn"
              onClick={handlePlayArpeggio}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/80 hover:text-white font-semibold text-xs md:text-sm border border-white/10 shadow transition-all cursor-pointer"
            >
              <Music2 className="w-4 h-4 text-red-400" />
              アルペジオ
            </button>
          </div>
        </div>
      </div>

      {/* Constituents & Degree Breakdown Banner */}
      <div className="mt-6 pt-5 border-t border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
            構成音とインターバル度数 (Constituents & Degrees)
          </span>
          <div className="text-base md:text-lg font-mono font-bold text-white tracking-widest">
            {chord.noteNames.join('  •  ')}
          </div>
        </div>

        {/* Sophisticated Degree Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {chord.noteNames.map((noteName, idx) => {
            const roleKey = chord.roles[idx] || 'extension';
            const roleInfo = INTERVAL_ROLES[roleKey] || INTERVAL_ROLES.root;
            const degreeDesc = chord.intervals[idx] === 0 ? 'ルート (根音)' : chord.intervalNames[idx];

            return (
              <div
                key={`degree-card-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#0F0F11] border border-white/5 hover:border-white/10 transition-all shadow-inner"
              >
                {/* Note Pill */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-extrabold text-base shadow-md"
                  style={{ backgroundColor: `${roleInfo.hexColor}20`, color: roleInfo.hexColor, border: `1px solid ${roleInfo.hexColor}50` }}
                >
                  {noteName}
                </div>

                {/* Role and Interval Name */}
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold" style={{ color: roleInfo.hexColor }}>
                    {chord.intervalNames[idx]}
                  </span>
                  <span className="text-[10px] text-white/40 font-medium">
                    {degreeDesc} ({chord.solfegeNames[idx]})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

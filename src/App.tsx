import React, { useState, useEffect } from 'react';
import { GeneratedChord, generateChord } from './types/music';
import { midiService, MidiState } from './services/midiService';
import { audioSynth } from './services/audioSynth';
import { Navbar, AppMode } from './components/Navbar';
import { ChordDictionaryView } from './components/ChordDictionaryView';
import { FlashcardQuizView } from './components/FlashcardQuizView';
import { ProgressionPlayAlongView } from './components/ProgressionPlayAlongView';
import { CircleOfFifthsView } from './components/CircleOfFifthsView';
import { MidiSettingsModal } from './components/MidiSettingsModal';
import { ClefType } from './components/StaffNotation';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('dictionary');
  const [currentChord, setCurrentChord] = useState<GeneratedChord>(() =>
    generateChord(0, 'maj7')
  ); // Defaults to Cmaj7
  const [midiState, setMidiState] = useState<MidiState>(() =>
    midiService.getState()
  );
  const [clef, setClef] = useState<ClefType>('treble');
  const [looseMatching, setLooseMatching] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Subscribe to MIDI Service updates
  useEffect(() => {
    const unsubscribe = midiService.subscribe((state) => {
      setMidiState(state);
    });
    return () => unsubscribe();
  }, []);

  // Evaluate if current active notes match the current target chord
  const matchInfo = midiService.evaluateChordMatch(
    currentChord.pitchClasses,
    looseMatching,
    !looseMatching
  );

  const handleSuccessJingle = () => {
    audioSynth.playSuccessJingle();
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioSynth.setMuted(next);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0B] text-white flex flex-col antialiased select-none selection:bg-red-600 selection:text-white">
      {/* Top Header Navbar (flex-none) */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        midiState={midiState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 min-h-0 w-full max-w-[1720px] mx-auto p-2 sm:p-2.5 md:p-3 overflow-y-auto md:overflow-hidden flex flex-col">
        {currentMode === 'dictionary' && (
          <ChordDictionaryView
            selectedChord={currentChord}
            onSelectChord={setCurrentChord}
            isMatched={matchInfo.isMatch}
            activeMidiNotes={midiState.activeMidiNotes}
            matchInfo={matchInfo}
            clef={clef}
            onClefChange={setClef}
          />
        )}

        {currentMode === 'flashcard' && (
          <FlashcardQuizView
            currentChord={currentChord}
            onSetChord={setCurrentChord}
            isMatched={matchInfo.isMatch}
            onSuccessJingle={handleSuccessJingle}
            activeMidiNotes={midiState.activeMidiNotes}
            clef={clef}
            onClefChange={setClef}
          />
        )}

        {currentMode === 'progression' && (
          <ProgressionPlayAlongView
            currentChord={currentChord}
            onSetChord={setCurrentChord}
            isMatched={matchInfo.isMatch}
            onSuccessJingle={handleSuccessJingle}
            activeMidiNotes={midiState.activeMidiNotes}
            clef={clef}
            onClefChange={setClef}
          />
        )}

        {currentMode === 'circle' && (
          <CircleOfFifthsView
            currentChord={currentChord}
            onSetChord={setCurrentChord}
            isMatched={matchInfo.isMatch}
            onSuccessJingle={handleSuccessJingle}
            activeMidiNotes={midiState.activeMidiNotes}
            clef={clef}
            onClefChange={setClef}
          />
        )}
      </main>

      {/* MIDI & Audio Settings Modal */}
      <MidiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        midiState={midiState}
        looseMatching={looseMatching}
        setLooseMatching={setLooseMatching}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Footer Status Bar (flex-none) */}
      <footer className="flex-none min-h-7 py-1 border-t border-white/5 bg-[#0A0A0B] px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-[10px] md:text-[11px] text-white/40 font-mono">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="font-semibold text-white/70">Khordgraph</span>
          <span className="opacity-40">|</span>
          <span className="truncate">
            {currentChord.fullName} [{currentChord.noteNames.join(' - ')}]
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-[10px]">
          <span>MIDI: {midiState.isConnected ? 'CONNECTED' : 'STANDBY'}</span>
          <span className="opacity-40">|</span>
          <span>Web Audio Engine</span>
        </div>
      </footer>
    </div>
  );
}

import { PitchClass } from '../types/music';
import { audioSynth } from './audioSynth';

// Minimal Web MIDI interfaces for cross-platform compatibility
interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  onstatechange: (() => void) | null;
}

interface MIDIInput {
  id: string;
  name?: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIMessageEvent {
  data: Uint8Array;
}

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
}

export type MidiListener = (state: MidiState) => void;

export interface MidiState {
  isSupported: boolean;
  isConnected: boolean;
  devices: MidiDeviceInfo[];
  activeMidiNotes: number[]; // e.g. [60, 64, 67]
  activePitchClasses: PitchClass[]; // e.g. [0, 4, 7]
  lastPlayedNote: number | null;
}

class MidiService {
  private midiAccess: MIDIAccess | null = null;
  private activeNotes: Set<number> = new Set();
  private listeners: Set<MidiListener> = new Set();
  private isSupported: boolean = false;
  private isConnected: boolean = false;
  private devices: MidiDeviceInfo[] = [];
  private lastPlayedNote: number | null = null;

  constructor() {
    this.checkSupportAndInit();
  }

  public async checkSupportAndInit() {
    if (typeof window === 'undefined') return;

    const nav = navigator as unknown as { requestMIDIAccess?: (opt?: { sysex: boolean }) => Promise<MIDIAccess> };
    if (nav.requestMIDIAccess) {
      this.isSupported = true;
      try {
        this.midiAccess = await nav.requestMIDIAccess({ sysex: false });
        this.updateDeviceList();

        this.midiAccess.onstatechange = () => {
          this.updateDeviceList();
        };

        this.attachInputs();
        this.notify();
      } catch (err) {
        console.warn('Web MIDI API access was denied or failed:', err);
        this.notify();
      }
    } else {
      this.isSupported = false;
      this.notify();
    }
  }

  private updateDeviceList() {
    if (!this.midiAccess) return;

    const devs: MidiDeviceInfo[] = [];
    let connectedCount = 0;

    this.midiAccess.inputs.forEach((input) => {
      devs.push({
        id: input.id,
        name: input.name || 'Unknown MIDI Device',
        manufacturer: input.manufacturer || 'Generic',
        state: input.state === 'connected' ? 'connected' : 'disconnected',
      });
      if (input.state === 'connected') {
        connectedCount++;
      }
    });

    this.devices = devs;
    this.isConnected = connectedCount > 0;
    this.attachInputs();
    this.notify();
  }

  private attachInputs() {
    if (!this.midiAccess) return;

    this.midiAccess.inputs.forEach((input) => {
      input.onmidimessage = (event: MIDIMessageEvent) => {
        this.handleMidiMessage(event);
      };
    });
  }

  private handleMidiMessage(event: MIDIMessageEvent) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const command = data[0] >> 4;
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;

    // Note On (0x9) with velocity > 0
    if (command === 9 && velocity > 0) {
      this.noteOn(note, velocity / 127);
    }
    // Note Off (0x8) or Note On with velocity 0
    else if (command === 8 || (command === 9 && velocity === 0)) {
      this.noteOff(note);
    }
  }

  public noteOn(note: number, velocity = 0.8) {
    this.activeNotes.add(note);
    this.lastPlayedNote = note;
    audioSynth.playNote(note, velocity);
    this.notify();
  }

  public noteOff(note: number) {
    this.activeNotes.delete(note);
    audioSynth.stopNote(note);
    this.notify();
  }

  public clearAllNotes() {
    this.activeNotes.forEach((note) => audioSynth.stopNote(note));
    this.activeNotes.clear();
    this.notify();
  }

  public getState(): MidiState {
    const activeMidiNotes = Array.from(this.activeNotes).sort((a, b) => a - b);
    const activePitchClasses = Array.from(
      new Set(activeMidiNotes.map((n) => (n % 12) as PitchClass))
    ).sort((a, b) => a - b);

    return {
      isSupported: this.isSupported,
      isConnected: this.isConnected,
      devices: this.devices,
      activeMidiNotes,
      activePitchClasses,
      lastPlayedNote: this.lastPlayedNote,
    };
  }

  public subscribe(listener: MidiListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Check if current held notes match the target chord
   * @param targetPitchClasses e.g. [2, 5, 9, 0] for Dm7
   * @param looseMatch if true, all required pitch classes must be present regardless of octave
   * @param exactNotesOnly if true, no extra unintended pitch classes are allowed
   */
  public evaluateChordMatch(
    targetPitchClasses: PitchClass[],
    looseMatch = true,
    exactNotesOnly = true
  ): { isMatch: boolean; missingPitchClasses: PitchClass[]; extraPitchClasses: PitchClass[] } {
    const state = this.getState();
    const playedPcs = state.activePitchClasses;

    if (playedPcs.length === 0) {
      return {
        isMatch: false,
        missingPitchClasses: [...targetPitchClasses],
        extraPitchClasses: [],
      };
    }

    const missingPitchClasses = targetPitchClasses.filter((pc) => !playedPcs.includes(pc));
    const extraPitchClasses = playedPcs.filter((pc) => !targetPitchClasses.includes(pc));

    if (looseMatch) {
      if (exactNotesOnly) {
        // Must contain all target notes and NO extra notes
        const isMatch = missingPitchClasses.length === 0 && extraPitchClasses.length === 0;
        return { isMatch, missingPitchClasses, extraPitchClasses };
      } else {
        // Beginner friendly: as long as all target notes are pressed
        const isMatch = missingPitchClasses.length === 0;
        return { isMatch, missingPitchClasses, extraPitchClasses };
      }
    }

    return {
      isMatch: missingPitchClasses.length === 0 && extraPitchClasses.length === 0,
      missingPitchClasses,
      extraPitchClasses,
    };
  }
}

export const midiService = new MidiService();

// Music theory definitions and data structures

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface NoteInfo {
  pitchClass: PitchClass;
  name: string; // e.g. "C", "C#", "Db"
  sharpName: string;
  flatName: string;
  solfege: string; // "ド", "レ", etc.
}

export const NOTE_NAMES: NoteInfo[] = [
  { pitchClass: 0, name: 'C', sharpName: 'C', flatName: 'C', solfege: 'ド' },
  { pitchClass: 1, name: 'C#', sharpName: 'C#', flatName: 'D♭', solfege: 'ド#' },
  { pitchClass: 2, name: 'D', sharpName: 'D', flatName: 'D', solfege: 'レ' },
  { pitchClass: 3, name: 'D#', sharpName: 'D#', flatName: 'E♭', solfege: 'レ#' },
  { pitchClass: 4, name: 'E', sharpName: 'E', flatName: 'E', solfege: 'ミ' },
  { pitchClass: 5, name: 'F', sharpName: 'F', flatName: 'F', solfege: 'ファ' },
  { pitchClass: 6, name: 'F#', sharpName: 'F#', flatName: 'G♭', solfege: 'ファ#' },
  { pitchClass: 7, name: 'G', sharpName: 'G', flatName: 'G', solfege: 'ソ' },
  { pitchClass: 8, name: 'G#', sharpName: 'G#', flatName: 'A♭', solfege: 'ソ#' },
  { pitchClass: 9, name: 'A', sharpName: 'A', flatName: 'A', solfege: 'ラ' },
  { pitchClass: 10, name: 'A#', sharpName: 'A#', flatName: 'B♭', solfege: 'ラ#' },
  { pitchClass: 11, name: 'B', sharpName: 'B', flatName: 'B', solfege: 'シ' },
];

export type IntervalRoleType = 'root' | 'third' | 'fifth' | 'seventh' | 'extension';

export interface IntervalInfo {
  semitones: number;
  degreeName: string; // "Root", "3rd", "5th", etc.
  shortName: string; // "R", "3", "b3", "5", "b5", "7", "M7", "9"
  role: IntervalRoleType;
  color: string; // Tailwind class
  hexColor: string;
  badgeBg: string;
}

export const INTERVAL_ROLES: Record<string, { role: IntervalRoleType; color: string; hexColor: string; badgeBg: string }> = {
  root: { role: 'root', color: 'text-red-500', hexColor: '#EF4444', badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400' },
  third: { role: 'third', color: 'text-blue-400', hexColor: '#60A5FA', badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
  fifth: { role: 'fifth', color: 'text-green-400', hexColor: '#4ADE80', badgeBg: 'bg-green-500/10 border-green-500/30 text-green-300' },
  seventh: { role: 'seventh', color: 'text-yellow-400', hexColor: '#FACC15', badgeBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' },
  extension: { role: 'extension', color: 'text-purple-400', hexColor: '#C084FC', badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300' },
};

export interface ChordTypeDefinition {
  id: string;
  name: string; // "Major", "Minor", etc.
  symbol: string; // "", "m", "7", "Maj7", etc.
  category: 'basic' | 'seventh' | 'extended' | 'altered';
  intervals: number[]; // semitone offsets from root [0, 4, 7]
  intervalNames: string[]; // ["R", "3", "5"]
  degreeDescriptions: string[]; // ["Root (ルート)", "Major 3rd (長3度)", "Perfect 5th (完全5度)"]
  roles: IntervalRoleType[];
  description: string;
  mood: string;
}

export const CHORD_TYPES: ChordTypeDefinition[] = [
  {
    id: 'maj',
    name: 'Major',
    symbol: '',
    category: 'basic',
    intervals: [0, 4, 7],
    intervalNames: ['R', '3', '5'],
    degreeDescriptions: ['ルート (根音)', '長3度 (Major 3rd)', '完全5度 (Perfect 5th)'],
    roles: ['root', 'third', 'fifth'],
    description: '最も基本的で明るく安定した響きの長三和音。',
    mood: '明るい・堂々とした・安定',
  },
  {
    id: 'min',
    name: 'Minor',
    symbol: 'm',
    category: 'basic',
    intervals: [0, 3, 7],
    intervalNames: ['R', '♭3', '5'],
    degreeDescriptions: ['ルート (根音)', '短3度 (Minor 3rd)', '完全5度 (Perfect 5th)'],
    roles: ['root', 'third', 'fifth'],
    description: '哀愁や落ち着きのある短三和音。3度が半音低くなっています。',
    mood: '切ない・落ち着いた・暗い',
  },
  {
    id: '7',
    name: 'Dominant 7th',
    symbol: '7',
    category: 'seventh',
    intervals: [0, 4, 7, 10],
    intervalNames: ['R', '3', '5', '♭7'],
    degreeDescriptions: ['ルート (根音)', '長3度 (Major 3rd)', '完全5度 (Perfect 5th)', '短7度 (Minor 7th)'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: 'ブルースやロック、トニックへの強い進行感（ドミナントモーション）を持つコード。',
    mood: '緊張感・ブルージー・前進感',
  },
  {
    id: 'maj7',
    name: 'Major 7th',
    symbol: 'Maj7',
    category: 'seventh',
    intervals: [0, 4, 7, 11],
    intervalNames: ['R', '3', '5', '7'],
    degreeDescriptions: ['ルート (根音)', '長3度 (Major 3rd)', '完全5度 (Perfect 5th)', '長7度 (Major 7th)'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: 'ジャズやシティポップに欠かせない、透明感と都会的な浮遊感のある響き。',
    mood: '都会的・爽やか・エモい',
  },
  {
    id: 'm7',
    name: 'Minor 7th',
    symbol: 'm7',
    category: 'seventh',
    intervals: [0, 3, 7, 10],
    intervalNames: ['R', '♭3', '5', '♭7'],
    degreeDescriptions: ['ルート (根音)', '短3度 (Minor 3rd)', '完全5度 (Perfect 5th)', '短7度 (Minor 7th)'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: 'メロウで洗練された響き。ツーファイブ進行のii7として超頻出。',
    mood: 'メロウ・哀愁・オシャレ',
  },
  {
    id: 'dim',
    name: 'Diminished',
    symbol: 'dim',
    category: 'altered',
    intervals: [0, 3, 6],
    intervalNames: ['R', '♭3', '♭5'],
    degreeDescriptions: ['ルート (根音)', '短3度 (Minor 3rd)', '減5度 (Diminished 5th)'],
    roles: ['root', 'third', 'fifth'],
    description: '短3度を2つ重ねた減三和音。不穏で不安定な緊張感を生みます。',
    mood: '不穏・スリリング・経過音',
  },
  {
    id: 'aug',
    name: 'Augmented',
    symbol: 'aug',
    category: 'altered',
    intervals: [0, 4, 8],
    intervalNames: ['R', '3', '♯5'],
    degreeDescriptions: ['ルート (根音)', '長3度 (Major 3rd)', '増5度 (Augmented 5th)'],
    roles: ['root', 'third', 'fifth'],
    description: '長3度を2つ重ねた増三和音。幻想的で未来的な広がりを持ちます。',
    mood: '幻想的・浮遊感・不思議',
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    symbol: 'sus4',
    category: 'basic',
    intervals: [0, 5, 7],
    intervalNames: ['R', '4', '5'],
    degreeDescriptions: ['ルート (根音)', '完全4度 (Perfect 4th)', '完全5度 (Perfect 5th)'],
    roles: ['root', 'third', 'fifth'],
    description: '3度の代わりに4度を使ったコード。解決したくなる爽快な浮遊感。',
    mood: '爽快・引っ張り感・解放前',
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished (m7♭5)',
    symbol: 'm7♭5',
    category: 'altered',
    intervals: [0, 3, 6, 10],
    intervalNames: ['R', '♭3', '♭5', '♭7'],
    degreeDescriptions: ['ルート (根音)', '短3度 (Minor 3rd)', '減5度 (Diminished 5th)', '短7度 (Minor 7th)'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: 'マイナーキーのツーファイブ（iiø - V7 - i）で活躍するダークで美しい響き。',
    mood: 'ダーク・ジャジー・大人びた',
  },
  {
    id: 'add9',
    name: 'Add 9',
    symbol: 'add9',
    category: 'extended',
    intervals: [0, 4, 7, 14], // 14 is 9th (2 + 12)
    intervalNames: ['R', '3', '5', '9'],
    degreeDescriptions: ['ルート (根音)', '長3度 (Major 3rd)', '完全5度 (Perfect 5th)', '長9度 (Major 9th)'],
    roles: ['root', 'third', 'fifth', 'extension'],
    description: 'メジャーコードにきらびやかな9度音を加えた、J-POPやアニソンで大人気のコード。',
    mood: 'キラキラ・感動的・広がりのある',
  },
  // Additional helpful chord types (giving even more than 120 variations)
  {
    id: 'dim7',
    name: 'Diminished 7th',
    symbol: 'dim7',
    category: 'altered',
    intervals: [0, 3, 6, 9],
    intervalNames: ['R', '♭3', '♭5', '♭♭7'],
    degreeDescriptions: ['ルート (根音)', '短3度', '減5度', '減7度'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: '短3度間隔で4音並んだ完全対称コード。パッシングコードとして便利。',
    mood: 'ドラマチック・劇的',
  },
  {
    id: '6',
    name: 'Major 6th',
    symbol: '6',
    category: 'extended',
    intervals: [0, 4, 7, 9],
    intervalNames: ['R', '3', '5', '6'],
    degreeDescriptions: ['ルート (根音)', '長3度', '完全5度', '長6度'],
    roles: ['root', 'third', 'fifth', 'seventh'],
    description: '素朴で優しいノスタルジックな温かみのあるコード。',
    mood: '懐かしい・穏やか・優しい',
  },
];

export interface GeneratedChord {
  id: string;
  rootIndex: number; // 0-11
  rootName: string; // "C", "D#", "Eb"
  rootSolfege: string;
  typeId: string;
  typeName: string;
  symbol: string;
  fullName: string; // "Cmaj7"
  intervals: number[];
  intervalNames: string[];
  roles: IntervalRoleType[];
  pitchClasses: PitchClass[]; // pitch classes 0-11
  noteNames: string[]; // ["C", "E", "G", "B"]
  solfegeNames: string[]; // ["ド", "ミ", "ソ", "シ"]
  midiNotes: number[]; // recommended middle C voicing (e.g. [60, 64, 67, 71])
  description: string;
  mood: string;
}

// 12 Roots
export const ROOTS: { pitchClass: PitchClass; name: string; altName?: string; solfege: string }[] = [
  { pitchClass: 0, name: 'C', solfege: 'ド' },
  { pitchClass: 1, name: 'C#', altName: 'D♭', solfege: 'ド#' },
  { pitchClass: 2, name: 'D', solfege: 'レ' },
  { pitchClass: 3, name: 'D#', altName: 'E♭', solfege: 'レ#' },
  { pitchClass: 4, name: 'E', solfege: 'ミ' },
  { pitchClass: 5, name: 'F', solfege: 'ファ' },
  { pitchClass: 6, name: 'F#', altName: 'G♭', solfege: 'ファ#' },
  { pitchClass: 7, name: 'G', solfege: 'ソ' },
  { pitchClass: 8, name: 'G#', altName: 'A♭', solfege: 'ソ#' },
  { pitchClass: 9, name: 'A', solfege: 'ラ' },
  { pitchClass: 10, name: 'A#', altName: 'B♭', solfege: 'ラ#' },
  { pitchClass: 11, name: 'B', solfege: 'シ' },
];

export function getEnharmonicNoteName(pitchClass: PitchClass, preferFlat = false): string {
  const note = NOTE_NAMES[pitchClass];
  return preferFlat ? note.flatName : note.sharpName;
}

export function generateChord(rootIndex: number, typeId: string): GeneratedChord {
  const root = ROOTS[rootIndex % 12];
  const chordType = CHORD_TYPES.find((t) => t.id === typeId) || CHORD_TYPES[0];

  // Prefer flat for roots like F, Bb, Eb, Ab, Db
  const preferFlat = [1, 3, 5, 8, 10].includes(root.pitchClass);

  const pitchClasses: PitchClass[] = chordType.intervals.map(
    (interval) => ((root.pitchClass + interval) % 12) as PitchClass
  );

  const noteNames = pitchClasses.map((pc) => getEnharmonicNoteName(pc, preferFlat));
  const solfegeNames = pitchClasses.map((pc) => NOTE_NAMES[pc].solfege);

  // Recommended baseline MIDI notes (around Middle C / Octave 4, MIDI 60)
  // If root pitch class is high (e.g. A, B), start at octave 3 (MIDI 45-59) to keep in convenient keyboard range
  const baseOctave = root.pitchClass >= 7 ? 3 : 4;
  const baseMidi = 12 * (baseOctave + 1) + root.pitchClass; // C4 is 60 (12*(4+1)+0)

  const midiNotes = chordType.intervals.map((interval) => baseMidi + interval);

  const fullName = `${root.name}${chordType.symbol}`;

  return {
    id: `${root.name}_${chordType.id}`,
    rootIndex: root.pitchClass,
    rootName: root.name,
    rootSolfege: root.solfege,
    typeId: chordType.id,
    typeName: chordType.name,
    symbol: chordType.symbol,
    fullName,
    intervals: chordType.intervals,
    intervalNames: chordType.intervalNames,
    roles: chordType.roles,
    pitchClasses,
    noteNames,
    solfegeNames,
    midiNotes,
    description: chordType.description,
    mood: chordType.mood,
  };
}

/**
 * Returns chord MIDI notes optimized for the chosen clef:
 * - 'treble': centered around C4 (octave 3-4, MIDI ~55-75)
 * - 'bass': centered around C3 (octave 2-3, MIDI ~43-63) to fit naturally within the 5 bass lines (G2 to A3)
 */
export function getClefOptimizedMidiNotes(chord: GeneratedChord, clef: 'treble' | 'bass' = 'treble'): number[] {
  const shift = clef === 'bass' ? -12 : 0;
  return chord.midiNotes.map((m) => m + shift);
}

export function getClefOptimizedChord(chord: GeneratedChord, clef: 'treble' | 'bass' = 'treble'): GeneratedChord {
  if (clef === 'treble') return chord;
  return {
    ...chord,
    midiNotes: chord.midiNotes.map((m) => m - 12),
  };
}

// Generate the complete 120+ chord dictionary
export const ALL_120_CHORDS: GeneratedChord[] = [];
for (let r = 0; r < 12; r++) {
  for (const ct of CHORD_TYPES.slice(0, 10)) {
    ALL_120_CHORDS.push(generateChord(r, ct.id));
  }
}

// Chord Progression Interfaces
export interface ChordProgressionStep {
  rootOffset: number; // 0 = C (Key Root), semitones from tonic
  typeId: string;
  degreeLabel: string; // "I", "IV", "V", "vi", "ii7", etc.
  beats?: number;
  lyricHint?: string;
}

export interface ProgressionPreset {
  id: string;
  name: string;
  japaneseName: string;
  category: 'pop' | 'jazz' | 'jpop' | 'anime' | 'classic';
  description: string;
  famousSongs: string;
  steps: ChordProgressionStep[];
}

export const PROGRESSION_PRESETS: ProgressionPreset[] = [
  {
    id: 'royal',
    name: 'Royal Road Progression (王道進行)',
    japaneseName: '王道進行 (IV - V - iii - vi)',
    category: 'jpop',
    description: 'J-POPやアニソンのサビで最も使われる感動的で前向きな進行。',
    famousSongs: '「夜に駆ける」「ロビンソン」「God knows...」「Pretender」など数千曲',
    steps: [
      { rootOffset: 5, typeId: 'maj7', degreeLabel: 'IVM7', beats: 4 }, // Fmaj7 in C
      { rootOffset: 7, typeId: '7', degreeLabel: 'V7', beats: 4 },     // G7
      { rootOffset: 4, typeId: 'm7', degreeLabel: 'iiim7', beats: 4 },  // Em7
      { rootOffset: 9, typeId: 'm7', degreeLabel: 'vim7', beats: 4 },   // Am7
    ],
  },
  {
    id: 'two_five_one',
    name: 'Major II-V-I (ツーファイブワン)',
    japaneseName: 'ツーファイブワン (ii7 - V7 - IM7)',
    category: 'jazz',
    description: 'ジャズやポピュラー音楽における最も重要で美しい終止進行。',
    famousSongs: '「Autumn Leaves」「Fly Me to the Moon」「Over the Rainbow」',
    steps: [
      { rootOffset: 2, typeId: 'm7', degreeLabel: 'ii7', beats: 4 },   // Dm7
      { rootOffset: 7, typeId: '7', degreeLabel: 'V7', beats: 4 },     // G7
      { rootOffset: 0, typeId: 'maj7', degreeLabel: 'IM7', beats: 4 },  // Cmaj7
      { rootOffset: 0, typeId: 'maj7', degreeLabel: 'IM7', beats: 4 },  // Cmaj7
    ],
  },
  {
    id: 'canon',
    name: 'Canon Progression (カノン進行)',
    japaneseName: 'カノン進行 (I - V - vi - iii - IV - I - IV - V)',
    category: 'classic',
    description: 'パッヘルベルのカノンから生まれた、美しいベースライン下降が特徴の王道進行。',
    famousSongs: '「マリーゴールド」「さくら(独唱)」「Let It Be」「愛をこめて花束を」',
    steps: [
      { rootOffset: 0, typeId: 'maj', degreeLabel: 'I', beats: 4 },   // C
      { rootOffset: 7, typeId: 'maj', degreeLabel: 'V', beats: 4 },   // G
      { rootOffset: 9, typeId: 'min', degreeLabel: 'vi', beats: 4 },  // Am
      { rootOffset: 4, typeId: 'min', degreeLabel: 'iii', beats: 4 }, // Em
      { rootOffset: 5, typeId: 'maj', degreeLabel: 'IV', beats: 4 },  // F
      { rootOffset: 0, typeId: 'maj', degreeLabel: 'I', beats: 4 },   // C
      { rootOffset: 5, typeId: 'maj', degreeLabel: 'IV', beats: 4 },  // F
      { rootOffset: 7, typeId: 'maj', degreeLabel: 'V', beats: 4 },   // G
    ],
  },
  {
    id: 'komuro',
    name: 'Komuro Progression (小室進行)',
    japaneseName: '小室進行 (vi - IV - V - I)',
    category: 'jpop',
    description: '90年代TKサウンドやアニソン・ゲーム音楽を象徴するスリリングで切ない進行。',
    famousSongs: '「Get Wild」「千本桜」「コネクト」「残酷な天使のテーゼ」',
    steps: [
      { rootOffset: 9, typeId: 'min', degreeLabel: 'vi', beats: 4 },  // Am
      { rootOffset: 5, typeId: 'maj', degreeLabel: 'IV', beats: 4 },  // F
      { rootOffset: 7, typeId: 'maj', degreeLabel: 'V', beats: 4 },   // G
      { rootOffset: 0, typeId: 'maj', degreeLabel: 'I', beats: 4 },   // C
    ],
  },
  {
    id: 'marusa',
    name: 'Marusa / Just the Two of Us (丸サ進行)',
    japaneseName: '丸サ進行 (IVM7 - III7 - vim7 - I7)',
    category: 'jpop',
    description: '椎名林檎の丸の内サディスティックやJust the Two of Usで世界的に愛されるオシャレ進行。',
    famousSongs: '「丸の内サディスティック」「Just the Two of Us」「うっせぇわ」「エイリアンズ」',
    steps: [
      { rootOffset: 5, typeId: 'maj7', degreeLabel: 'IVM7', beats: 4 }, // Fmaj7
      { rootOffset: 4, typeId: '7', degreeLabel: 'III7', beats: 4 },    // E7
      { rootOffset: 9, typeId: 'm7', degreeLabel: 'vim7', beats: 4 },   // Am7
      { rootOffset: 0, typeId: '7', degreeLabel: 'I7 (vm7-I7)', beats: 4 }, // C7
    ],
  },
  {
    id: 'four_chord_pop',
    name: '4-Chord Pop (ポップス4コード進行)',
    japaneseName: 'ポップス4コード (I - V - vi - IV)',
    category: 'pop',
    description: '世界中の洋楽・邦楽ヒット曲を支える最も有名な4コードループ。',
    famousSongs: '「Don\'t Stop Believin\'」「Someone Like You」「Country Roads」',
    steps: [
      { rootOffset: 0, typeId: 'maj', degreeLabel: 'I', beats: 4 },   // C
      { rootOffset: 7, typeId: 'maj', degreeLabel: 'V', beats: 4 },   // G
      { rootOffset: 9, typeId: 'min', degreeLabel: 'vi', beats: 4 },  // Am
      { rootOffset: 5, typeId: 'maj', degreeLabel: 'IV', beats: 4 },  // F
    ],
  },
  {
    id: 'minor_two_five_one',
    name: 'Minor II-V-I (マイナーツーファイブワン)',
    japaneseName: 'マイナーツーファイブ (iiø - V7 - im7)',
    category: 'jazz',
    description: '短調（マイナーキー）における最高峰の哀愁とドラマチックな解決進行。',
    famousSongs: '「Black Orpheus」「Blue Bossa」「Cry Me a River」',
    steps: [
      { rootOffset: 2, typeId: 'm7b5', degreeLabel: 'iiø (m7♭5)', beats: 4 }, // Dm7b5
      { rootOffset: 7, typeId: '7', degreeLabel: 'V7', beats: 4 },           // G7
      { rootOffset: 0, typeId: 'm7', degreeLabel: 'im7', beats: 4 },          // Cm7
      { rootOffset: 0, typeId: 'm7', degreeLabel: 'im7', beats: 4 },          // Cm7
    ],
  },
];

// Helper to transpose a progression to any key
export function getTransposedProgression(
  preset: ProgressionPreset,
  keyPitchClass: PitchClass // 0 = C, 2 = D, etc.
): GeneratedChord[] {
  return preset.steps.map((step) => {
    const actualRoot = (keyPitchClass + step.rootOffset) % 12;
    return generateChord(actualRoot, step.typeId);
  });
}

// Circle of Fifths Data
export interface CircleKeyData {
  pitchClass: PitchClass;
  majorName: string;
  minorName: string;
  sharpsCount: number; // >0 for sharps, <0 for flats (e.g. -3 for Eb), 0 for C
  signatureText: string;
  positionAngle: number; // in degrees (C at 0, G at 30, D at 60...)
  diatonicChords: { degree: string; chord: GeneratedChord }[];
}

export const CIRCLE_OF_FIFTHS: CircleKeyData[] = [
  { pitchClass: 0, majorName: 'C', minorName: 'Am', sharpsCount: 0, signatureText: '調号なし', positionAngle: 0, diatonicChords: [] },
  { pitchClass: 7, majorName: 'G', minorName: 'Em', sharpsCount: 1, signatureText: '♯ × 1 (F#)', positionAngle: 30, diatonicChords: [] },
  { pitchClass: 2, majorName: 'D', minorName: 'Bm', sharpsCount: 2, signatureText: '♯ × 2 (F#, C#)', positionAngle: 60, diatonicChords: [] },
  { pitchClass: 9, majorName: 'A', minorName: 'F#m', sharpsCount: 3, signatureText: '♯ × 3 (F#, C#, G#)', positionAngle: 90, diatonicChords: [] },
  { pitchClass: 4, majorName: 'E', minorName: 'C#m', sharpsCount: 4, signatureText: '♯ × 4 (F#, C#, G#, D#)', positionAngle: 120, diatonicChords: [] },
  { pitchClass: 11, majorName: 'B', minorName: 'G#m', sharpsCount: 5, signatureText: '♯ × 5 (F#, C#, G#, D#, A#)', positionAngle: 150, diatonicChords: [] },
  { pitchClass: 6, majorName: 'F# / G♭', minorName: 'D#m / E♭m', sharpsCount: 6, signatureText: '♯ × 6 / ♭ × 6', positionAngle: 180, diatonicChords: [] },
  { pitchClass: 1, majorName: 'D♭', minorName: 'B♭m', sharpsCount: -5, signatureText: '♭ × 5 (B♭, E♭, A♭, D♭, G♭)', positionAngle: 210, diatonicChords: [] },
  { pitchClass: 8, majorName: 'A♭', minorName: 'Fm', sharpsCount: -4, signatureText: '♭ × 4 (B♭, E♭, A♭, D♭)', positionAngle: 240, diatonicChords: [] },
  { pitchClass: 3, majorName: 'E♭', minorName: 'Cm', sharpsCount: -3, signatureText: '♭ × 3 (B♭, E♭, A♭)', positionAngle: 270, diatonicChords: [] },
  { pitchClass: 10, majorName: 'B♭', minorName: 'Gm', sharpsCount: -2, signatureText: '♭ × 2 (B♭, E♭)', positionAngle: 300, diatonicChords: [] },
  { pitchClass: 5, majorName: 'F', minorName: 'Dm', sharpsCount: -1, signatureText: '♭ × 1 (B♭)', positionAngle: 330, diatonicChords: [] },
];

// Populate diatonic chords for each key
const DIATONIC_DEGREES = [
  { offset: 0, type: 'maj', label: 'I (Tonic)' },
  { offset: 2, type: 'm7', label: 'ii7 (Supertonic)' },
  { offset: 4, type: 'm7', label: 'iii7 (Mediant)' },
  { offset: 5, type: 'maj7', label: 'IVM7 (Subdominant)' },
  { offset: 7, type: '7', label: 'V7 (Dominant)' },
  { offset: 9, type: 'm7', label: 'vim7 (Submediant)' },
  { offset: 11, type: 'm7b5', label: 'viiø (Leading Tone)' },
];

CIRCLE_OF_FIFTHS.forEach((key) => {
  key.diatonicChords = DIATONIC_DEGREES.map((d) => ({
    degree: d.label,
    chord: generateChord((key.pitchClass + d.offset) % 12, d.type),
  }));
});

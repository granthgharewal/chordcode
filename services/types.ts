export interface ChordProgression {
  time: number; // Time in seconds
  chord: string;
  duration: number;
  lyricLine?: string; // Optional lyric line for chord-lyric alignment
  section?: string; // Optional section (verse, chorus, bridge)
}

export interface SongInfo {
  title: string;
  artist: string;
  duration: number;
  thumbnail: string;
  url: string;
  album?: string; // Optional album information
  year?: number; // Optional release year
  genre?: string; // Optional genre
  popularity?: string; // Optional popularity rating
  description?: string; // Optional description
}

export interface ChordAnalysisResult {
  songInfo: SongInfo;
  chords: ChordProgression[];
  key: string;
  tempo: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  capo?: number; // Optional capo position
  tuning?: string; // Optional tuning information
  strummingPattern?: string; // Optional strumming pattern
  timeSignature?: string; // Optional time signature
  sections?: { // Optional song structure
    verse?: string[];
    chorus?: string[];
    bridge?: string[];
  };
  songStructure?: string[]; // Optional song structure array
  alternativeCapo?: { // Optional alternative capo position
    position: number;
    chords: string[];
  };
}

export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  chords: string[];
  techniques: string[];
  tips: string[];
  practiceTime?: number; // Optional practice time estimate
  commonMistakes?: string[]; // Optional common mistakes
}

export interface GuitarTutorial {
  overview: string;
  difficulty: string;
  estimatedTime: number;
  steps: TutorialStep[];
  practiceNotes: string[];
  requirements?: string[]; // Optional requirements
  chordDiagrams?: Record<string, string>; // Optional chord diagrams
  playingTips?: { // Optional playing tips
    strumming?: string;
    rhythm?: string;
    transitions?: string;
  };
  performanceTips?: string[]; // Optional performance tips
}

export interface FullAnalysisResult {
  analysis: ChordAnalysisResult;
  tutorial: GuitarTutorial;
}

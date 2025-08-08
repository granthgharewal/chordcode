import { Alert } from 'react-native';
import { ChordAnalysisResult, ChordProgression, FullAnalysisResult, GuitarTutorial, SongInfo } from './types';
import { extractYouTubeVideoId } from './utils';

// Configuration constants
const YOUTUBE_DATA_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with actual API key
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with actual API key

/**
 * Analyzes a YouTube music URL to extract chords and generate tutorial
 */
export const analyzeYouTubeMusic = async (url: string): Promise<FullAnalysisResult> => {
    try {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            Alert.alert('Invalid YouTube URL');
            throw new Error('Invalid YouTube URL');
        }

        // Fetch song info (title, artist, duration, thumbnail, url)
        const songInfo = await getSongInfo(videoId);

        // Optionally, fetch lyrics (mock implementation)
        const lyrics = await getLyrics(songInfo.title, songInfo.artist);

        // Analyze chords
        const chordAnalysis = await analyzeChords(videoId);

        // Generate tutorial based on chord analysis
        const tutorial = await generateTutorial(chordAnalysis);

        return {
            analysis: {
                songInfo: {
                    ...songInfo,
                    lyrics // add lyrics to songInfo if needed
                },
                ...chordAnalysis
            },
            tutorial
        };
    } catch (error) {
        console.error('Error analyzing YouTube music:', error);
        throw new Error('Failed to analyze the song. Please check the URL and try again.');
    }
};

// Mock lyrics fetcher for demonstration
const getLyrics = async (title: string, artist: string): Promise<string> => {
    // Replace with actual lyrics API call if available
    return `Lyrics for "${title}" by ${artist} are not available in demo mode.`;
};

/**
 * Fetches song metadata from YouTube
 */
const getSongInfo = async (videoId: string): Promise<SongInfo> => {
  // Mock implementation - replace with actual YouTube Data API call
  return getMockSongInfo(videoId);
};

/**
 * Analyzes audio to extract chord progressions
 */
const analyzeChords = async (videoId: string): Promise<Omit<ChordAnalysisResult, 'songInfo'>> => {
  // Mock implementation - replace with actual audio analysis
  return getMockChordAnalysis();
};

/**
 * Generates guitar tutorial using AI
 */
const generateTutorial = async (chordAnalysis: Omit<ChordAnalysisResult, 'songInfo'>): Promise<GuitarTutorial> => {
  // Mock implementation - replace with OpenAI API call
  return getMockTutorial(chordAnalysis);
};

/**
 * Mock song info for demonstration
 */
const getMockSongInfo = (videoId: string): SongInfo => {
  const mockSongs: Record<string, SongInfo> = {
    default: {
      title: "Wonderwall",
      artist: "Oasis",
      duration: 258,
      thumbnail: "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg",
      url: `https://youtube.com/watch?v=${videoId}`
    }
  };

  return mockSongs[videoId] || {
    title: "Unknown Song",
    artist: "Unknown Artist",
    duration: 180,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    url: `https://youtube.com/watch?v=${videoId}`
  };
};

/**
 * Mock chord analysis for demonstration
 */
const getMockChordAnalysis = (): Omit<ChordAnalysisResult, 'songInfo'> => {
  const chords: ChordProgression[] = [
    { time: 0, chord: "Em7", duration: 4 },
    { time: 4, chord: "G", duration: 4 },
    { time: 8, chord: "D", duration: 4 },
    { time: 12, chord: "C", duration: 4 },
    { time: 16, chord: "Em7", duration: 4 },
    { time: 20, chord: "G", duration: 4 },
    { time: 24, chord: "D", duration: 4 },
    { time: 28, chord: "C", duration: 4 },
    { time: 32, chord: "Am", duration: 4 },
    { time: 36, chord: "C", duration: 4 },
    { time: 40, chord: "D", duration: 4 },
    { time: 44, chord: "G", duration: 4 }
  ];

  return {
    chords,
    key: "G Major",
    tempo: 87,
    difficulty: "Beginner"
  };
};

/**
 * Mock tutorial generation for demonstration
 */
const getMockTutorial = (chordAnalysis: Omit<ChordAnalysisResult, 'songInfo'>): GuitarTutorial => {
  const uniqueChords = [...new Set(chordAnalysis.chords.map(c => c.chord))];
  
  return {
    overview: `This song is in ${chordAnalysis.key} and uses ${uniqueChords.length} main chords. It's perfect for ${chordAnalysis.difficulty.toLowerCase()} players with a moderate tempo of ${chordAnalysis.tempo} BPM.`,
    difficulty: chordAnalysis.difficulty,
    estimatedTime: 30,
    steps: [
      {
        step: 1,
        title: "Learn the Chord Shapes",
        description: "Master the basic chord fingerings before attempting to play the song.",
        chords: uniqueChords,
        techniques: ["Open chords", "Basic strumming"],
        tips: [
          "Practice each chord until you can form it cleanly",
          "Use a metronome to keep steady timing",
          "Focus on clean chord changes"
        ]
      },
      {
        step: 2,
        title: "Practice Chord Transitions",
        description: "Work on smooth transitions between the chord changes.",
        chords: uniqueChords.slice(0, 2),
        techniques: ["Chord transitions", "Finger positioning"],
        tips: [
          "Start slowly and gradually increase speed",
          "Keep your thumb behind the neck",
          "Minimize finger movement between chords"
        ]
      },
      {
        step: 3,
        title: "Learn the Strumming Pattern",
        description: "Add the strumming pattern to match the original song.",
        chords: [],
        techniques: ["Down strums", "Up strums", "Rhythm patterns"],
        tips: [
          "Start with simple down strums",
          "Listen to the original for rhythm cues",
          "Practice with a metronome"
        ]
      },
      {
        step: 4,
        title: "Play Along with the Song",
        description: "Put it all together and play along with the original track.",
        chords: uniqueChords,
        techniques: ["Full song performance", "Playing along"],
        tips: [
          "Start at a slower tempo if needed",
          "Focus on staying in time with the recording",
          "Don't worry about perfection - have fun!"
        ]
      }
    ],
    practiceNotes: [
      "Practice for 15-20 minutes daily for best results",
      "Record yourself playing to identify areas for improvement",
      "Try playing along with different versions of the song",
      "Experiment with different strumming patterns once comfortable"
    ]
  };
};

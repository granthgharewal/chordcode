import { Alert } from "react-native";
import {
  ChordAnalysisResult,
  FullAnalysisResult,
  GuitarTutorial,
  SongInfo,
} from "./types";

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT =
  process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT ||
  "https://your-resource.openai.azure.com/";
const AZURE_OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_AZURE_OPENAI_API_KEY || "YOUR_AZURE_OPENAI_API_KEY";

/**
 * Search for songs by name using Azure OpenAI
 */
export const searchSongs = async (query: string): Promise<SongInfo[]> => {
  try {
    if (
      !AZURE_OPENAI_API_KEY ||
      AZURE_OPENAI_API_KEY === "YOUR_AZURE_OPENAI_API_KEY"
    ) {
      console.warn("Azure OpenAI API key not configured");
      Alert.alert("Warning", "Azure OpenAI API key not configured");
    }

    const prompt = `
Search for songs matching the query: "${query}"

Please provide a JSON array of the top 5 most popular and well-known songs that match this search.
Include variations, covers, and different versions if applicable.

Format as:
[
  {
    "title": "Perfect",
    "artist": "Ed Sheeran",
    "album": "÷ (Divide)",
    "year": 2017,
    "genre": "Pop, Romantic Ballad",
    "duration": 263,
    "popularity": "Very High",
    "description": "Romantic ballad, one of Ed Sheeran's biggest hits"
  }
]
Include accurate metadata.
`;

    const response = await callAzureOpenAI(prompt);

    if (response && Array.isArray(response)) {
      const result = response.map((song: any) => ({
        title: song.title,
        artist: song.artist,
        duration: song.duration || 180,
        thumbnail: `https://via.placeholder.com/480x360/1e293b/white?text=${encodeURIComponent(
          song.artist
        )}+-+${encodeURIComponent(song.title)}`,
        url: `song://${encodeURIComponent(song.artist)}-${encodeURIComponent(
          song.title
        )}`,
        album: song.album,
        year: song.year,
        genre: song.genre,
        popularity: song.popularity,
        description: song.description,
      }));
      console.log("response", response);
      return result;
    }
  } catch (error) {
    console.error("Error searching songs with Azure OpenAI:", error);
    return getMockSongSearchResults(query);
  }
};

/**
 * Analyzes a selected song to extract chords and generate tutorial
 */
export const analyzeSongByName = async (
  songInfo: SongInfo
): Promise<FullAnalysisResult> => {
  try {
    // Analyze chords using Azure OpenAI
    const chordAnalysis = await analyzeChordsWithAzureAI(songInfo);

    // Generate tutorial based on chord analysis
    const tutorial = await generateTutorialWithAzureAI(songInfo, chordAnalysis);

    return {
      analysis: {
        songInfo,
        ...chordAnalysis,
      },
      tutorial,
    };
  } catch (error) {
    console.error("Error analyzing song:", error);
    throw new Error("Failed to analyze the song. Please try again.");
  }
};

/**
 * Call Azure OpenAI API with error handling and retry logic
 */
const callAzureOpenAI = async (
  prompt: string,
  maxTokens: number = 2000
): Promise<any> => {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${AZURE_OPENAI_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert music theorist and guitar instructor with extensive knowledge of popular songs, chord progressions, and guitar techniques. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.3,
          top_p: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Azure OpenAI API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in Azure OpenAI response");
      }

      // Clean and parse JSON response
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleanContent);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Azure OpenAI attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff: wait 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError!;
};

/**
 * Analyze chords for a specific song using Azure OpenAI
 */
const analyzeChordsWithAzureAI = async (
  songInfo: SongInfo
): Promise<Omit<ChordAnalysisResult, "songInfo">> => {
  try {
    const prompt = `
Analyze the chord progression for the song "${songInfo.title}" by ${songInfo.artist}.

Please provide a detailed and accurate chord analysis in JSON format:

{
  "chords": [
    {"time": 0, "chord": "G", "duration": 8, "lyricLine": "First line of lyrics", "section": "verse"},
    {"time": 8, "chord": "Em", "duration": 8, "lyricLine": "Second line of lyrics", "section": "verse"}
  ],
  "key": "G Major",
  "tempo": 63,
  "difficulty": "Beginner",
  "capo": 0,
  "tuning": "Standard (E-A-D-G-B-E)",
  "strummingPattern": "D-D-U-U-D-U",
  "timeSignature": "4/4",
  "sections": {
    "verse": ["G", "Em", "C", "D"],
    "chorus": ["Em", "C", "G", "D"],
    "bridge": ["Am", "F", "C", "G"]
  },
  "songStructure": ["verse", "verse", "chorus", "verse", "chorus", "bridge", "chorus"],
  "alternativeCapo": {
    "position": 3,
    "chords": ["Em", "C#m", "A", "B"]
  }
}

Requirements:
- Provide accurate chord progressions based on the actual song
- Include timing information that matches the song structure
- Consider the song's genre and style for appropriate difficulty rating
- Include common alternative capo positions if applicable
- Focus on the most commonly played version of the song
`;

    const response = await callAzureOpenAI(prompt, 2500);

    if (response) {
      // Validate and clean the response
      const chords = response.chords || [];
      return {
        chords: chords.map((chord: any) => ({
          time: chord.time || 0,
          chord: chord.chord || "C",
          duration: chord.duration || 4,
          lyricLine: chord.lyricLine || "",
          section: chord.section || "verse",
        })),
        key: response.key || "C Major",
        tempo: response.tempo || 120,
        difficulty: response.difficulty || "Beginner",
        capo: response.capo || 0,
        tuning: response.tuning || "Standard (E-A-D-G-B-E)",
        strummingPattern: response.strummingPattern || "D-D-U-U-D-U",
        timeSignature: response.timeSignature || "4/4",
        sections: response.sections || { verse: ["C", "G", "Am", "F"] },
        songStructure: response.songStructure || ["verse", "chorus"],
        alternativeCapo: response.alternativeCapo,
      };
    }

    throw new Error("Invalid response from Azure OpenAI");
  } catch (error) {
    console.error("Error analyzing chords with Azure OpenAI:", error);
    // Fallback to enhanced mock analysis
    return getEnhancedMockChordAnalysis(songInfo);
  }
};

/**
 * Generate comprehensive guitar tutorial using Azure OpenAI
 */
const generateTutorialWithAzureAI = async (
  songInfo: SongInfo,
  chordAnalysis: Omit<ChordAnalysisResult, "songInfo">
): Promise<GuitarTutorial> => {
  try {
    const uniqueChords = [...new Set(chordAnalysis.chords.map((c) => c.chord))];

    const prompt = `
Create a comprehensive guitar tutorial for "${songInfo.title}" by ${
      songInfo.artist
    }.

Song Details:
- Key: ${chordAnalysis.key}
- Tempo: ${chordAnalysis.tempo} BPM
- Difficulty: ${chordAnalysis.difficulty}
- Chords used: ${uniqueChords.join(", ")}
- Capo: ${chordAnalysis.capo || 0}
- Strumming Pattern: ${chordAnalysis.strummingPattern}

Please provide a detailed tutorial in JSON format:

{
  "overview": "Comprehensive overview of the song and what makes it special to learn...",
  "difficulty": "${chordAnalysis.difficulty}",
  "estimatedTime": 45,
  "requirements": ["Basic chord knowledge", "Strumming experience"],
  "chordDiagrams": {
    "G": "e|---3---|\\nB|---0---|\\nG|---0---|\\nD|---0---|\\nA|---2---|\\nE|---3---|",
    "Em": "e|---0---|\\nB|---0---|\\nG|---0---|\\nD|---2---|\\nA|---2---|\\nE|---0---|"
  },
  "steps": [
    {
      "step": 1,
      "title": "Master Individual Chords",
      "description": "Learn each chord shape cleanly",
      "chords": ["G", "Em"],
      "techniques": ["Open chords", "Finger placement"],
      "tips": ["Keep thumb behind neck", "Press firmly but don't squeeze"],
      "practiceTime": 10,
      "commonMistakes": ["Muted strings", "Buzzing"]
    }
  ],
  "practiceNotes": ["Practice daily", "Use metronome"],
  "playingTips": {
    "strumming": "Focus on the down-up pattern",
    "rhythm": "Count along with the beat",
    "transitions": "Practice chord changes slowly first"
  },
  "performanceTips": ["Start simple", "Build confidence", "Have fun"]
}

Requirements:
- Create 5-7 progressive learning steps
- Include specific chord diagrams for all chords
- Provide realistic time estimates
- Include common mistakes and how to avoid them
- Add performance and practice tips
- Make it suitable for the specified difficulty level
`;

    const response = await callAzureOpenAI(prompt, 3000);

    if (response) {
      return {
        overview:
          response.overview ||
          `Learn to play "${songInfo.title}" by ${songInfo.artist}`,
        difficulty: response.difficulty || chordAnalysis.difficulty,
        estimatedTime: response.estimatedTime || 45,
        requirements: response.requirements || ["Basic chord knowledge"],
        chordDiagrams: response.chordDiagrams || {},
        steps: response.steps || [],
        practiceNotes: response.practiceNotes || ["Practice regularly"],
        playingTips: response.playingTips || {},
        performanceTips: response.performanceTips || ["Have fun!"],
      };
    }

    throw new Error("Invalid tutorial response");
  } catch (error) {
    console.error("Error generating tutorial with Azure OpenAI:", error);
    // Fallback to enhanced mock tutorial
    return getEnhancedMockTutorial(songInfo, chordAnalysis);
  }
};

/**
 * Get mock song search results for fallback
 */
const getMockSongSearchResults = (query: string): SongInfo[] => {
  const mockSongs = [
    {
      title: "Perfect",
      artist: "Ed Sheeran",
      duration: 263,
      thumbnail:
        "https://via.placeholder.com/480x360/1e293b/white?text=Ed+Sheeran+-+Perfect",
      url: "song://Ed-Sheeran-Perfect",
      album: "÷ (Divide)",
      year: 2017,
      genre: "Pop",
      popularity: "Very High",
      description: "Romantic ballad, one of Ed Sheeran's biggest hits",
    },
    {
      title: "Wonderwall",
      artist: "Oasis",
      duration: 258,
      thumbnail:
        "https://via.placeholder.com/480x360/1e293b/white?text=Oasis+-+Wonderwall",
      url: "song://Oasis-Wonderwall",
      album: "(What's the Story) Morning Glory?",
      year: 1995,
      genre: "Rock",
      popularity: "Very High",
      description: "Classic British rock anthem, perfect for beginners",
    },
    {
      title: "Shape of You",
      artist: "Ed Sheeran",
      duration: 233,
      thumbnail:
        "https://via.placeholder.com/480x360/1e293b/white?text=Ed+Sheeran+-+Shape+of+You",
      url: "song://Ed-Sheeran-Shape-of-You",
      album: "÷ (Divide)",
      year: 2017,
      genre: "Pop",
      popularity: "Very High",
      description: "Upbeat pop song with simple chord progression",
    },
    {
      title: "Let It Be",
      artist: "The Beatles",
      duration: 243,
      thumbnail:
        "https://via.placeholder.com/480x360/1e293b/white?text=The+Beatles+-+Let+It+Be",
      url: "song://The-Beatles-Let-It-Be",
      album: "Let It Be",
      year: 1970,
      genre: "Rock",
      popularity: "Very High",
      description: "Timeless classic with simple chord progression",
    },
    {
      title: "House of the Rising Sun",
      artist: "The Animals",
      duration: 272,
      thumbnail:
        "https://via.placeholder.com/480x360/1e293b/white?text=The+Animals+-+House+of+the+Rising+Sun",
      url: "song://The-Animals-House-of-the-Rising-Sun",
      album: "The Animals",
      year: 1964,
      genre: "Folk Rock",
      popularity: "High",
      description: "Classic fingerpicking song, great for intermediate players",
    },
  ];

  // Filter songs based on query
  const filtered = mockSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.genre?.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.length > 0 ? filtered : mockSongs.slice(0, 3);
};

/**
 * Enhanced mock functions for fallback scenarios
 */
const getEnhancedMockChordAnalysis = (
  songInfo: SongInfo
): Omit<ChordAnalysisResult, "songInfo"> => {
  // Enhanced mock data based on popular songs
  const commonProgressions: Record<string, any> = {
    perfect: {
      chords: [
        {
          time: 0,
          chord: "G",
          duration: 8,
          lyricLine: "I found a love for me",
          section: "verse",
        },
        {
          time: 8,
          chord: "Em",
          duration: 8,
          lyricLine: "Darling, just dive right in",
          section: "verse",
        },
        {
          time: 16,
          chord: "C",
          duration: 8,
          lyricLine: "Well, I found a girl beautiful and sweet",
          section: "verse",
        },
        {
          time: 24,
          chord: "D",
          duration: 8,
          lyricLine: "I never knew you were the someone waiting for me",
          section: "verse",
        },
        {
          time: 32,
          chord: "Em",
          duration: 4,
          lyricLine: "Baby, I'm dancing in the dark",
          section: "chorus",
        },
        {
          time: 36,
          chord: "C",
          duration: 4,
          lyricLine: "with you between my arms",
          section: "chorus",
        },
        {
          time: 40,
          chord: "G",
          duration: 4,
          lyricLine: "Barefoot on the grass",
          section: "chorus",
        },
        {
          time: 44,
          chord: "D",
          duration: 4,
          lyricLine: "listening to our favourite song",
          section: "chorus",
        },
      ],
      key: "G Major",
      tempo: 63,
      difficulty: "Beginner",
      capo: 0,
      tuning: "Standard (E-A-D-G-B-E)",
      strummingPattern: "D-D-U-U-D-U",
      timeSignature: "4/4",
      sections: {
        verse: ["G", "Em", "C", "D"],
        chorus: ["Em", "C", "G", "D"],
      },
    },
    wonderwall: {
      chords: [
        {
          time: 0,
          chord: "Em7",
          duration: 4,
          lyricLine: "Today is gonna be the day",
          section: "verse",
        },
        {
          time: 4,
          chord: "G",
          duration: 4,
          lyricLine: "that they're gonna throw it back to you",
          section: "verse",
        },
        {
          time: 8,
          chord: "D",
          duration: 4,
          lyricLine: "By now you should've somehow",
          section: "verse",
        },
        {
          time: 12,
          chord: "C",
          duration: 4,
          lyricLine: "realized what you gotta do",
          section: "verse",
        },
      ],
      key: "G Major",
      tempo: 87,
      difficulty: "Beginner",
      capo: 0,
      tuning: "Standard (E-A-D-G-B-E)",
      strummingPattern: "D-D-U-U-D-U",
      timeSignature: "4/4",
      sections: {
        verse: ["Em7", "G", "D", "C"],
        chorus: ["C", "D", "G", "Em"],
      },
    },
  };

  const songKey = songInfo.title.toLowerCase();
  const matchedSong = Object.keys(commonProgressions).find((key) =>
    songKey.includes(key)
  );

  if (matchedSong) {
    return commonProgressions[matchedSong];
  }

  // Default progression
  return {
    chords: [
      {
        time: 0,
        chord: "C",
        duration: 4,
        lyricLine: "First line of the song",
        section: "verse",
      },
      {
        time: 4,
        chord: "G",
        duration: 4,
        lyricLine: "Second line continues",
        section: "verse",
      },
      {
        time: 8,
        chord: "Am",
        duration: 4,
        lyricLine: "Third line with emotion",
        section: "verse",
      },
      {
        time: 12,
        chord: "F",
        duration: 4,
        lyricLine: "Fourth line completes the thought",
        section: "verse",
      },
    ],
    key: "C Major",
    tempo: 120,
    difficulty: "Beginner",
    capo: 0,
    tuning: "Standard (E-A-D-G-B-E)",
    strummingPattern: "D-D-U-U-D-U",
    timeSignature: "4/4",
    sections: {
      verse: ["C", "G", "Am", "F"],
      chorus: ["F", "C", "G", "Am"],
    },
  };
};

const getEnhancedMockTutorial = (
  songInfo: SongInfo,
  chordAnalysis: Omit<ChordAnalysisResult, "songInfo">
): GuitarTutorial => {
  const uniqueChords = [...new Set(chordAnalysis.chords.map((c) => c.chord))];

  return {
    overview: `"${songInfo.title}" by ${
      songInfo.artist
    } is an excellent song for guitar players. This song is in the key of ${
      chordAnalysis.key
    } and features ${uniqueChords.length} main chords. With a tempo of ${
      chordAnalysis.tempo
    } BPM, it's perfect for ${chordAnalysis.difficulty.toLowerCase()} level players to practice chord transitions and develop their strumming technique.`,
    difficulty: chordAnalysis.difficulty,
    estimatedTime: 45,
    requirements: ["Basic chord knowledge", "Comfortable with chord changes"],
    chordDiagrams: {
      G: "e|---3---|\\nB|---0---|\\nG|---0---|\\nD|---0---|\\nA|---2---|\\nE|---3---|",
      Em: "e|---0---|\\nB|---0---|\\nG|---0---|\\nD|---2---|\\nA|---2---|\\nE|---0---|",
      C: "e|---0---|\\nB|---1---|\\nG|---0---|\\nD|---2---|\\nA|---3---|\\nE|-------|",
      D: "e|---2---|\\nB|---3---|\\nG|---2---|\\nD|---0---|\\nA|-------|\\nE|-------|",
      Am: "e|---0---|\\nB|---1---|\\nG|---2---|\\nD|---2---|\\nA|---0---|\\nE|-------|",
      F: "e|---1---|\\nB|---1---|\\nG|---2---|\\nD|---3---|\\nA|---3---|\\nE|---1---|",
    },
    steps: [
      {
        step: 1,
        title: "Master Individual Chord Shapes",
        description:
          "Learn to form each chord cleanly and hold it for at least 10 seconds without buzzing or muted strings.",
        chords: uniqueChords,
        techniques: ["Open chords", "Finger placement", "Clean fretting"],
        tips: [
          "Keep your thumb positioned behind the neck for support",
          "Press strings just hard enough to get clear notes",
          "Practice forming each chord from scratch 10 times",
          "Check that each string rings clearly by plucking individually",
        ],
        practiceTime: 15,
        commonMistakes: [
          "Muted strings",
          "Buzzing frets",
          "Incorrect finger placement",
        ],
      },
      {
        step: 2,
        title: "Practice Chord Transitions",
        description:
          "Work on smooth transitions between chord pairs, focusing on efficient finger movements.",
        chords: uniqueChords.slice(0, 2),
        techniques: ["Chord transitions", "Finger economy", "Pivot fingers"],
        tips: [
          "Identify which fingers can stay in place during transitions",
          "Practice transitions slowly and gradually increase speed",
          "Use a metronome starting at 60 BPM",
          "Focus on accuracy over speed initially",
        ],
        practiceTime: 20,
        commonMistakes: [
          "Lifting all fingers unnecessarily",
          "Rushing transitions",
          "Inconsistent timing",
        ],
      },
      {
        step: 3,
        title: "Learn the Strumming Pattern",
        description:
          "Master the strumming pattern that complements this song's rhythm and feel.",
        chords: [uniqueChords[0]],
        techniques: ["Down strums", "Up strums", "Rhythm patterns", "Dynamics"],
        tips: [
          "Start with simple down strums on each beat",
          "Gradually add up strums for more complex patterns",
          "Keep your wrist relaxed and use arm movement",
          "Listen to the original recording for rhythm reference",
        ],
        practiceTime: 15,
        commonMistakes: [
          "Tense wrist",
          "Inconsistent rhythm",
          "Too much force in strumming",
        ],
      },
      {
        step: 4,
        title: "Combine Chords and Strumming",
        description:
          "Put together chord changes with the strumming pattern, starting slowly.",
        chords: uniqueChords,
        techniques: ["Coordination", "Timing", "Muscle memory"],
        tips: [
          "Practice chord changes without strumming first",
          "Add simple strumming once chord changes are smooth",
          "Use a metronome to maintain steady timing",
          "Don't rush - consistency is more important than speed",
        ],
        practiceTime: 25,
        commonMistakes: [
          "Stopping rhythm during chord changes",
          "Speeding up or slowing down",
          "Inconsistent volume",
        ],
      },
      {
        step: 5,
        title: "Play Song Sections",
        description:
          "Learn to play through complete sections like verse and chorus.",
        chords: uniqueChords,
        techniques: ["Song structure", "Section transitions", "Performance"],
        tips: [
          "Practice each section separately before combining",
          "Pay attention to how sections flow together",
          "Practice transitions between verse and chorus",
          "Focus on maintaining the groove throughout",
        ],
        practiceTime: 20,
        commonMistakes: [
          "Losing timing between sections",
          "Forgetting chord progressions",
          "Inconsistent dynamics",
        ],
      },
      {
        step: 6,
        title: "Full Song Performance",
        description:
          "Play the complete song from start to finish, focusing on musical expression.",
        chords: uniqueChords,
        techniques: ["Full performance", "Dynamics", "Expression"],
        tips: [
          "Start at a slower tempo and gradually increase",
          "Add dynamics - play some parts softer, others louder",
          "Focus on the emotional content of the lyrics",
          "Record yourself to identify areas for improvement",
        ],
        practiceTime: 30,
        commonMistakes: [
          "Playing mechanically",
          "Ignoring song dynamics",
          "Not listening to the overall sound",
        ],
      },
    ],
    practiceNotes: [
      "Practice for 15-20 minutes daily for best results",
      "Use a metronome to develop steady timing",
      "Record yourself playing to track progress and identify issues",
      "Try playing along with different versions of the song",
      "Take breaks if your fingers get tired or sore",
      "Focus on quality over quantity in your practice sessions",
    ],
    playingTips: {
      strumming: "Focus on the down-up pattern and keep your wrist relaxed",
      rhythm: "Count along with the beat: '1-2-3-4' to maintain timing",
      transitions:
        "Practice chord changes slowly first, then gradually increase speed",
    },
    performanceTips: [
      "Start with a simplified version if the full arrangement is too challenging",
      "Focus on playing with confidence rather than perfection",
      "Enjoy the process and have fun with the music",
      "Practice regularly but don't overdo it - quality over quantity",
    ],
  };
};

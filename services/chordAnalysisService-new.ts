import { ChordAnalysisResult, ChordProgression, FullAnalysisResult, GuitarTutorial, SongInfo } from './types';

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.EXPO_PUBLIC_AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT_NAME = process.env.EXPO_PUBLIC_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
const AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

/**
 * Search for songs by name using Azure OpenAI
 */
export const searchSongs = async (query: string): Promise<SongInfo[]> => {
  try {
    if (!AZURE_OPENAI_API_KEY || AZURE_OPENAI_API_KEY === 'YOUR_AZURE_OPENAI_API_KEY') {
      console.warn('Azure OpenAI API key not configured, using mock data');
      return getMockSongSearchResults(query);
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
    "genre": "Pop",
    "duration": 263,
    "popularity": "Very High",
    "description": "Romantic ballad, one of Ed Sheeran's biggest hits"
  }
]

Focus on popular, well-known songs that guitarists commonly play. Include accurate metadata.
`;

    const response = await callAzureOpenAI(prompt);
    
    if (response && Array.isArray(response)) {
      return response.map((song: any) => ({
        title: song.title,
        artist: song.artist,
        duration: song.duration || 180,
        thumbnail: `https://via.placeholder.com/480x360/1e293b/white?text=${encodeURIComponent(song.artist)}+-+${encodeURIComponent(song.title)}`,
        url: `song://${encodeURIComponent(song.artist)}-${encodeURIComponent(song.title)}`,
        album: song.album,
        year: song.year,
        genre: song.genre,
        popularity: song.popularity,
        description: song.description
      }));
    }
    
    throw new Error('No valid response from Azure OpenAI');
  } catch (error) {
    console.error('Error searching songs with Azure OpenAI:', error);
    return getMockSongSearchResults(query);
  }
};

/**
 * Analyzes a selected song to extract chords and generate tutorial
 */
export const analyzeSongByName = async (songInfo: SongInfo): Promise<FullAnalysisResult> => {
  try {
    // Analyze chords using Azure OpenAI
    const chordAnalysis = await analyzeChordsWithAzureAI(songInfo);
    
    // Generate tutorial based on chord analysis
    const tutorial = await generateTutorialWithAzureAI(songInfo, chordAnalysis);

    return {
      analysis: {
        songInfo,
        ...chordAnalysis
      },
      tutorial
    };
  } catch (error) {
    console.error('Error analyzing song:', error);
    throw new Error('Failed to analyze the song. Please try again.');
  }
};

/**
 * Call Azure OpenAI API with error handling and retry logic
 */
const callAzureOpenAI = async (prompt: string, maxTokens: number = 2000): Promise<any> => {
  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_API_KEY
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are an expert music theorist and guitar instructor with extensive knowledge of popular songs, chord progressions, and guitar techniques. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: maxTokens,
            temperature: 0.3,
            top_p: 0.8
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in Azure OpenAI response');
      }

      // Clean and parse JSON response
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanContent);
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`Azure OpenAI attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Analyze chords for a specific song using Azure OpenAI
 */
const analyzeChordsWithAzureAI = async (songInfo: SongInfo): Promise<Omit<ChordAnalysisResult, 'songInfo'>> => {
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
          chord: chord.chord || 'C',
          duration: chord.duration || 4,
          lyricLine: chord.lyricLine || '',
          section: chord.section || 'verse'
        })),
        key: response.key || 'C Major',
        tempo: response.tempo || 120,
        difficulty: response.difficulty || 'Beginner',
        capo: response.capo || 0,
        tuning: response.tuning || 'Standard (E-A-D-G-B-E)',
        strummingPattern: response.strummingPattern || 'D-D-U-U-D-U',
        timeSignature: response.timeSignature || '4/4',
        sections: response.sections || { verse: ['C', 'G', 'Am', 'F'] },
        songStructure: response.songStructure || ['verse', 'chorus'],
        alternativeCapo: response.alternativeCapo
      };
    }
    
    throw new Error('Invalid response from Azure OpenAI');
  } catch (error) {
    console.error('Error analyzing chords with Azure OpenAI:', error);
    // Fallback to enhanced mock analysis
    return getMockChordAnalysis();
  }
};

/**
 * Generate comprehensive guitar tutorial using Azure OpenAI
 */
const generateTutorialWithAzureAI = async (
  songInfo: SongInfo, 
  chordAnalysis: Omit<ChordAnalysisResult, 'songInfo'>
): Promise<GuitarTutorial> => {
  try {
    const uniqueChords = [...new Set(chordAnalysis.chords.map(c => c.chord))];
    
    const prompt = `
Create a comprehensive guitar tutorial for "${songInfo.title}" by ${songInfo.artist}.

Song Details:
- Key: ${chordAnalysis.key}
- Tempo: ${chordAnalysis.tempo} BPM
- Difficulty: ${chordAnalysis.difficulty}
- Chords used: ${uniqueChords.join(', ')}
- Capo: ${(chordAnalysis as any).capo || 0}
- Strumming Pattern: ${(chordAnalysis as any).strummingPattern}

Please provide a detailed tutorial in JSON format:

{
  "overview": "Comprehensive overview of the song and what makes it special to learn...",
  "difficulty": "${chordAnalysis.difficulty}",
  "estimatedTime": 45,
  "requirements": ["Basic chord knowledge", "Strumming experience"],
  "chordDiagrams": {
    "G": "e|---3---|\nB|---0---|\nG|---0---|\nD|---0---|\nA|---2---|\nE|---3---|",
    "Em": "e|---0---|\nB|---0---|\nG|---0---|\nD|---2---|\nA|---2---|\nE|---0---|"
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
        overview: response.overview || `Learn to play "${songInfo.title}" by ${songInfo.artist}`,
        difficulty: response.difficulty || chordAnalysis.difficulty,
        estimatedTime: response.estimatedTime || 45,
        requirements: response.requirements || ['Basic chord knowledge'],
        chordDiagrams: response.chordDiagrams || {},
        steps: response.steps || [],
        practiceNotes: response.practiceNotes || ['Practice regularly'],
        playingTips: response.playingTips || {},
        performanceTips: response.performanceTips || ['Have fun!']
      };
    }
    
    throw new Error('Invalid tutorial response');
  } catch (error) {
    console.error('Error generating tutorial with Azure OpenAI:', error);
    // Fallback to enhanced mock tutorial
    return getMockTutorial(chordAnalysis);
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
      thumbnail: "https://via.placeholder.com/480x360/1e293b/white?text=Ed+Sheeran+-+Perfect",
      url: "song://Ed-Sheeran-Perfect",
      album: "÷ (Divide)",
      year: 2017,
      genre: "Pop",
      popularity: "Very High",
      description: "Romantic ballad, one of Ed Sheeran's biggest hits"
    },
    {
      title: "Wonderwall",
      artist: "Oasis",
      duration: 258,
      thumbnail: "https://via.placeholder.com/480x360/1e293b/white?text=Oasis+-+Wonderwall",
      url: "song://Oasis-Wonderwall",
      album: "(What's the Story) Morning Glory?",
      year: 1995,
      genre: "Rock",
      popularity: "Very High",
      description: "Classic British rock anthem, perfect for beginners"
    },
    {
      title: "Shape of You",
      artist: "Ed Sheeran",
      duration: 233,
      thumbnail: "https://via.placeholder.com/480x360/1e293b/white?text=Ed+Sheeran+-+Shape+of+You",
      url: "song://Ed-Sheeran-Shape-of-You",
      album: "÷ (Divide)",
      year: 2017,
      genre: "Pop",
      popularity: "Very High",
      description: "Upbeat pop song with simple chord progression"
    }
  ];

  // Filter songs based on query
  const filtered = mockSongs.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.length > 0 ? filtered : mockSongs.slice(0, 3);
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

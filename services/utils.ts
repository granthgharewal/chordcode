/**
 * Extracts video ID from various YouTube URL formats
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Validates if a URL is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubePattern.test(url) && extractYouTubeVideoId(url) !== null;
};

/**
 * Formats time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Validates chord name format
 */
export const isValidChord = (chord: string): boolean => {
  const chordPattern = /^[A-G][#b]?(m|maj|min|dim|aug|sus2|sus4|add9|7|maj7|m7|dim7|aug7)?(\/.+)?$/;
  return chordPattern.test(chord);
};

/**
 * Cleans and normalizes chord names
 */
export const normalizeChordName = (chord: string): string => {
  return chord
    .replace(/major/gi, 'maj')
    .replace(/minor/gi, 'm')
    .replace(/diminished/gi, 'dim')
    .replace(/augmented/gi, 'aug')
    .trim();
};

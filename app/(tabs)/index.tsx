import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, ScrollView, StyleSheet } from 'react-native';

import { ChordDisplay } from '@/components/ChordDisplay';
import { SongHeader } from '@/components/SongHeader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TutorialDisplay } from '@/components/TutorialDisplay';
import { UserInput } from '@/components/UserInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { analyzeSongByName, searchSongs } from '@/services/chordAnalysisService-azure';
import { FullAnalysisResult, SongInfo } from '@/services/types';

const HomeScreen = () => {
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SongInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  // Theme colors with more soothing palette
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor(
    { light: '#ffffff', dark: '#2a2a2a' }, 
    'background'
  );
  const searchResultsBackground = useThemeColor(
    { light: '#f8f9fa', dark: '#1a1a1a' }, 
    'background'
  );
  const errorBackground = useThemeColor(
    { light: '#fff5f5', dark: '#4a1a1a' }, 
    'background'
  );
  const errorBorder = useThemeColor(
    { light: '#fed7d7', dark: '#ff6b6b' }, 
    'tint'
  );
  const errorText = useThemeColor(
    { light: '#c53030', dark: '#ff6b6b' }, 
    'text'
  );

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const handleSearchSongs = useCallback(async (query: string) => {
    if (!query.trim()) {
      Alert.alert('Empty Search', 'Please enter a song name or artist');
      return;
    }

    setIsSearching(true);
    setError(null);
    // Reset results animation
    resultsAnim.setValue(0);
    
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
      
      // Animate search results in
      if (results.length > 0) {
        Animated.timing(resultsAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      Alert.alert('Search Failed', errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, [resultsAnim]);

  const handleAnalyzeSong = useCallback(async (songInfo: SongInfo) => {
    setIsLoading(true);
    setError(null);
    
    // Animate out search results
    Animated.timing(resultsAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSearchResults([]); // Clear search results after animation
    });
    
    try {
      const result = await analyzeSongByName(songInfo);
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      Alert.alert('Analysis Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [resultsAnim]);

  const handleClear = useCallback(() => {
    // Animate out results
    Animated.timing(resultsAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setAnalysisResult(null);
      setError(null);
      setSearchResults([]);
    });
  }, [resultsAnim]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <ThemedText type="title" style={styles.title}>ChordCode</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Get guitar chords and tutorials by searching song names
          </ThemedText>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <UserInput 
            onAnalyze={handleSearchSongs} 
            isLoading={isSearching || isLoading}
            onClear={handleClear}
            hasResult={!!analysisResult || searchResults.length > 0}
          />
        </Animated.View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Animated.View
            style={{
              opacity: resultsAnim,
              transform: [{
                translateY: resultsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              }]
            }}
          >
            <ThemedView style={[styles.searchResults, { backgroundColor: searchResultsBackground }]}>
              <ThemedText type="subtitle" style={styles.searchTitle}>Select a song:</ThemedText>
              {searchResults.map((song, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: resultsAnim,
                    transform: [{
                      translateY: resultsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }}
                >
                  <ThemedView 
                    style={[styles.songItem, { backgroundColor: cardBackground }]}
                    onTouchEnd={() => handleAnalyzeSong(song)}
                  >
                    <ThemedText type="defaultSemiBold">{song.title}</ThemedText>
                    <ThemedText type="default">{song.artist}</ThemedText>
                    {song.album && <ThemedText style={styles.albumText}>{song.album} ({song.year})</ThemedText>}
                    {song.description && <ThemedText style={styles.descriptionText}>{song.description}</ThemedText>}
                  </ThemedView>
                </Animated.View>
              ))}
            </ThemedView>
          </Animated.View>
        )}

        {(isSearching || isLoading) && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>
              {isSearching ? 'Searching for songs...' : 'Analyzing your song...'}
            </ThemedText>
          </ThemedView>
        )}

        {error && (
          <ThemedView style={[
            styles.errorContainer, 
            { 
              backgroundColor: errorBackground, 
              borderColor: errorBorder 
            }
          ]}>
            <ThemedText style={[styles.errorText, { color: errorText }]}>{error}</ThemedText>
          </ThemedView>
        )}

        {analysisResult && (
          <ThemedView style={styles.resultsContainer}>
            <SongHeader songInfo={analysisResult.analysis.songInfo} />
            <ChordDisplay 
              chords={analysisResult.analysis.chords}
              songKey={analysisResult.analysis.key}
              difficulty={analysisResult.analysis.difficulty}
              tempo={analysisResult.analysis.tempo}
            />
            <TutorialDisplay tutorial={analysisResult.tutorial} />
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  searchResults: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  songItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  albumText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default HomeScreen;

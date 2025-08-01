import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ChordProgression } from '@/services/types';
import { formatTime } from '@/services/utils';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ChordDisplayProps {
  chords: ChordProgression[];
  songKey: string;
  difficulty: string;
  tempo: number;
}

interface ChordButtonProps {
  chord: string;
  isSelected: boolean;
  onPress: () => void;
}

const ChordButton = memo(({ chord, isSelected, onPress }: ChordButtonProps) => {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <TouchableOpacity
      style={[
        styles.chordButton,
        {
          backgroundColor: isSelected ? tintColor : backgroundColor,
          borderColor: tintColor,
        }
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.chordButtonText,
          { color: isSelected ? 'white' : undefined }
        ]}
      >
        {chord}
      </ThemedText>
    </TouchableOpacity>
  );
});

ChordButton.displayName = 'ChordButton';

export const ChordDisplay = memo(({ chords, songKey, difficulty, tempo }: ChordDisplayProps) => {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [showLyricView, setShowLyricView] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tintColor = useThemeColor({}, 'tint');

  // Get unique chords for the chord selector
  const uniqueChords = [...new Set(chords.map(c => c.chord))];

  // Filter chord progressions by selected chord
  const filteredChords = selectedChord 
    ? chords.filter(c => c.chord === selectedChord)
    : chords;

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return tintColor;
    }
  }, [tintColor]);

  const handleChordSelect = useCallback((chord: string | null) => {
    setSelectedChord(chord === selectedChord ? null : chord);
  }, [selectedChord]);
  const clearFilter = useCallback(() => {
    setSelectedChord(null);
  }, []);

  const handleViewToggle = useCallback((value: boolean) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setShowLyricView(value);
  }, [fadeAnim]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Chord Analysis
      </ThemedText>

      {/* Song Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>Key</ThemedText>
          <ThemedText style={styles.infoValue}>{songKey}</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>Tempo</ThemedText>
          <ThemedText style={styles.infoValue}>{tempo} BPM</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <ThemedText style={styles.infoLabel}>Difficulty</ThemedText>
          <ThemedText style={[
            styles.infoValue,
            { color: getDifficultyColor(difficulty) }
          ]}>
            {difficulty}
          </ThemedText>
        </View>
      </View>

      {/* Chord Selector */}
      <ThemedText style={styles.subsectionTitle}>
        Chords Used ({uniqueChords.length})
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chordSelector}
        contentContainerStyle={styles.chordSelectorContent}
      >
        <ChordButton
          chord="All"
          isSelected={selectedChord === null}
          onPress={() => handleChordSelect(null)}
        />
        {uniqueChords.map((chord) => (
          <ChordButton
            key={chord}
            chord={chord}
            isSelected={selectedChord === chord}
            onPress={() => handleChordSelect(chord)}
          />
        ))}
      </ScrollView>

      {/* Chord Progression Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <ThemedText style={styles.subsectionTitle}>
            {showLyricView ? 'Chord Sheet' : 'Chord Progression'}
          </ThemedText>
          <View style={styles.headerControls}>
            <View style={styles.viewToggle}>
              <ThemedText style={styles.toggleLabel}>Timeline</ThemedText>
              <Switch
                value={showLyricView}
                onValueChange={handleViewToggle}
                trackColor={{ false: '#767577', true: tintColor }}
                thumbColor={showLyricView ? '#ffffff' : '#f4f3f4'}
                style={styles.switch}
              />
              <ThemedText style={styles.toggleLabel}>Sheet</ThemedText>
            </View>
            {selectedChord && (
              <TouchableOpacity
                style={styles.clearFilter}
                onPress={clearFilter}
              >
                <Ionicons name="close-circle" size={20} color={tintColor} />
                <ThemedText style={[styles.clearFilterText, { color: tintColor }]}>
                  Clear Filter
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView style={styles.timeline}>
            {showLyricView ? (
              // Chord Sheet Format View
              <>
                {filteredChords.reduce((sections, chordItem, index) => {
                  const section = chordItem.section || 'main';
                  const lastSection = sections[sections.length - 1];
                  
                  if (!lastSection || lastSection.sectionName !== section) {
                    sections.push({
                      sectionName: section,
                      chords: [chordItem],
                      key: `section-${section}-${index}`
                    });
                  } else {
                    lastSection.chords.push(chordItem);
                  }
                  
                  return sections;
                }, [] as { sectionName: string; chords: ChordProgression[]; key: string }[]).map((section) => (
                  <View key={section.key} style={styles.sectionContainer}>
                    {section.sectionName !== 'main' && (
                      <ThemedText style={styles.sectionHeader}>
                        [{section.sectionName.toUpperCase()}]
                      </ThemedText>
                    )}
                    {section.chords.map((chordItem, chordIndex) => (
                      <View key={`${section.key}-chord-${chordIndex}`} style={styles.chordSheetLine}>
                        <View style={styles.chordLineContainer}>
                          <ThemedText style={styles.chordLine}>
                            {chordItem.chord}
                          </ThemedText>
                        </View>
                        <View style={styles.lyricLineContainer}>
                          <ThemedText style={styles.lyricLine}>
                            {chordItem.lyricLine || 'Instrumental'}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.timingInfo}>
                          {formatTime(chordItem.time)} • {chordItem.duration}s
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            ) : (
              // Traditional Timeline View
              filteredChords.map((chordItem, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineTime}>
                    <ThemedText style={styles.timeText}>
                      {formatTime(chordItem.time)}
                    </ThemedText>
                  </View>
                  <View style={[styles.timelineDot, { backgroundColor: tintColor }]} />
                  <View style={styles.timelineContent}>
                    <ThemedText style={styles.chordName}>
                      {chordItem.chord}
                    </ThemedText>
                    <ThemedText style={styles.chordDuration}>
                      {chordItem.duration}s duration
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </ThemedView>
  );
});

ChordDisplay.displayName = 'ChordDisplay';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chordSelector: {
    marginBottom: 20,
  },
  chordSelectorContent: {
    paddingRight: 20,
  },
  chordButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 12,
  },
  chordButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: 14,
    marginLeft: 4,
  },
  timeline: {
    maxHeight: 300,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTime: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  chordName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chordDuration: {
    fontSize: 12,
    opacity: 0.6,
  },
  // New styles for view toggle and lyric display
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  lyricItem: {
    backgroundColor: 'rgba(107, 115, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B73FF',
  },
  lyricChordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chordBadge: {
    backgroundColor: '#6B73FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  chordBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lyricSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sectionLabel: {
    fontSize: 10,
    opacity: 0.6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  lyricLineContainer: {
    marginTop: 4,
  },
  lyricLine: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
    color: 'inherit',
  },
  lyricTiming: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'monospace',
  },
  // Chord Sheet Format Styles
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(107, 115, 255, 0.02)',
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    color: '#6B73FF',
    textAlign: 'left',
    backgroundColor: 'rgba(107, 115, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  chordSheetLine: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  chordLineContainer: {
    marginBottom: 2,
    minHeight: 20,
  },
  chordLine: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B73FF',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  timingInfo: {
    fontSize: 10,
    opacity: 0.4,
    marginTop: 6,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
});

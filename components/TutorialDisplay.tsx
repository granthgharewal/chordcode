import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { GuitarTutorial, TutorialStep } from '@/services/types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TutorialDisplayProps {
  tutorial: GuitarTutorial;
}

interface StepCardProps {
  step: TutorialStep;
  isExpanded: boolean;
  onToggle: () => void;
}

const StepCard = memo(({ step, isExpanded, onToggle }: StepCardProps) => {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.stepCard, { borderColor: tintColor }]}>
      <TouchableOpacity style={styles.stepHeader} onPress={onToggle}>
        <View style={styles.stepHeaderLeft}>
          <View style={[styles.stepNumber, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.stepNumberText}>{step.step}</ThemedText>
          </View>
          <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={tintColor}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.stepContent}>
          <ThemedText style={styles.stepDescription}>
            {step.description}
          </ThemedText>

          {step.chords.length > 0 && (
            <View style={styles.stepSection}>
              <ThemedText style={styles.sectionLabel}>Chords to Practice:</ThemedText>
              <View style={styles.chordList}>
                {step.chords.map((chord, index) => (
                  <View key={index} style={[styles.chordChip, { borderColor: tintColor }]}>
                    <ThemedText style={[styles.chordChipText, { color: tintColor }]}>
                      {chord}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step.techniques.length > 0 && (
            <View style={styles.stepSection}>
              <ThemedText style={styles.sectionLabel}>Techniques:</ThemedText>
              {step.techniques.map((technique, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="musical-note" size={14} color={tintColor} />
                  <ThemedText style={styles.listItemText}>{technique}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {step.tips.length > 0 && (
            <View style={styles.stepSection}>
              <ThemedText style={styles.sectionLabel}>Tips:</ThemedText>
              {step.tips.map((tip, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="bulb" size={14} color="#FFA500" />
                  <ThemedText style={styles.listItemText}>{tip}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
});

StepCard.displayName = 'StepCard';

export const TutorialDisplay = memo(({ tutorial }: TutorialDisplayProps) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]); // First step expanded by default
  const tintColor = useThemeColor({}, 'tint');

  const toggleStep = useCallback((stepNumber: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepNumber)
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    );
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSteps(tutorial.steps.map(s => s.step));
  }, [tutorial.steps]);

  const collapseAll = useCallback(() => {
    setExpandedSteps([]);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Guitar Tutorial
        </ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.expandButton} onPress={expandAll}>
            <ThemedText style={[styles.expandButtonText, { color: tintColor }]}>
              Expand All
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.expandButton} onPress={collapseAll}>
            <ThemedText style={[styles.expandButtonText, { color: tintColor }]}>
              Collapse All
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tutorial Overview */}
      <ThemedView style={[styles.overviewCard, { borderColor: tintColor }]}>
        <ThemedText style={styles.overview}>{tutorial.overview}</ThemedText>
        
        <View style={styles.tutorialMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={tintColor} />
            <ThemedText style={styles.metaText}>
              ~{tutorial.estimatedTime} minutes
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bar-chart" size={16} color={tintColor} />
            <ThemedText style={styles.metaText}>
              {tutorial.difficulty}
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Tutorial Steps */}
      <ScrollView style={styles.stepsContainer}>
        {tutorial.steps.map((step) => (
          <StepCard
            key={step.step}
            step={step}
            isExpanded={expandedSteps.includes(step.step)}
            onToggle={() => toggleStep(step.step)}
          />
        ))}
      </ScrollView>

      {/* Practice Notes */}
      {tutorial.practiceNotes.length > 0 && (
        <ThemedView style={[styles.practiceNotesCard, { borderColor: tintColor }]}>
          <View style={styles.practiceNotesHeader}>
            <Ionicons name="clipboard" size={20} color={tintColor} />
            <ThemedText style={styles.practiceNotesTitle}>Practice Notes</ThemedText>
          </View>
          {tutorial.practiceNotes.map((note, index) => (
            <View key={index} style={styles.practiceNoteItem}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <ThemedText style={styles.practiceNoteText}>{note}</ThemedText>
            </View>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
});

TutorialDisplay.displayName = 'TutorialDisplay';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  expandButton: {
    padding: 4,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  tutorialMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  stepContent: {
    padding: 16,
    paddingTop: 0,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  stepSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chordChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chordChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingRight: 8,
  },
  listItemText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  practiceNotesCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  practiceNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  practiceNoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  practiceNoteText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

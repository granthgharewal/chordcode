import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <ThemedView style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.cardDescription}>{description}</ThemedText>
    </ThemedView>
  );
}

export default function ExploreScreen() {
  const tintColor = useThemeColor({}, 'tint');

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/granthgharewal/chordcode');
  };

  const features = [
    {
      icon: 'musical-notes' as const,
      title: 'AI Chord Detection',
      description: 'Advanced AI algorithms analyze YouTube music to detect chord progressions with high accuracy.',
      color: '#FF6B6B'
    },
    {
      icon: 'school' as const,
      title: 'Interactive Tutorials',
      description: 'Step-by-step guitar tutorials generated specifically for each song, tailored to your skill level.',
      color: '#4ECDC4'
    },
    {
      icon: 'time' as const,
      title: 'Real-time Analysis',
      description: 'Get chord progressions and tutorials instantly without needing to store any data.',
      color: '#45B7D1'
    },
    {
      icon: 'trending-up' as const,
      title: 'Scalable Architecture',
      description: 'Built with TypeScript and modular design to easily add new features and integrations.',
      color: '#96CEB4'
    },
    {
      icon: 'phone-portrait' as const,
      title: 'Cross-Platform',
      description: 'Works seamlessly on iOS, Android, and web using Expo and React Native.',
      color: '#FFEAA7'
    },
    {
      icon: 'flash' as const,
      title: 'Fast & Efficient',
      description: 'Optimized performance with smart caching and efficient API usage.',
      color: '#DDA0DD'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>About ChordCode</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your AI-powered guitar learning companion
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText style={styles.description}>
            ChordCode revolutionizes guitar learning by using advanced AI to analyze any YouTube music video 
            and provide you with accurate chord progressions and personalized tutorials. Simply paste a YouTube 
            URL and get instant access to professional-quality guitar instruction.
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Features
          </ThemedText>

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}

          <ThemedView style={styles.techSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Technology Stack
            </ThemedText>
            
            <View style={styles.techGrid}>
              {[
                { name: 'TypeScript', icon: 'code-slash' },
                { name: 'React Native', icon: 'phone-portrait' },
                { name: 'Expo', icon: 'rocket' },
                { name: 'AI/ML APIs', icon: 'hardware-chip' }
              ].map((tech, index) => (
                <View key={index} style={[styles.techItem, { borderColor: tintColor }]}>
                  <Ionicons name={tech.icon as any} size={20} color={tintColor} />
                  <ThemedText style={styles.techName}>{tech.name}</ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>

          <TouchableOpacity
            style={[styles.githubButton, { backgroundColor: tintColor }]}
            onPress={handleOpenGitHub}
          >
            <Ionicons name="logo-github" size={20} color="white" />
            <ThemedText style={styles.githubButtonText}>
              View on GitHub
            </ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Built with ❤️ for the guitar community
            </ThemedText>
            <ThemedText style={styles.versionText}>
              Version 1.0.0
            </ThemedText>
          </ThemedView>
        </ThemedView>
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
  content: {
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  techSection: {
    marginTop: 16,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  techName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  githubButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.4,
  },
});

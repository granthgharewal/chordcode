import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { SongInfo } from '@/services/types';
import { formatTime } from '@/services/utils';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SongHeaderProps {
  songInfo: SongInfo;
}

export const SongHeader = memo(({ songInfo }: SongHeaderProps) => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: songInfo.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <ThemedText type="subtitle" style={styles.title}>
          {songInfo.title}
        </ThemedText>
        <ThemedText style={styles.artist}>
          {songInfo.artist}
        </ThemedText>
        <ThemedText style={styles.duration}>
          Duration: {formatTime(songInfo.duration)}
        </ThemedText>
      </View>
    </ThemedView>
  );
});

SongHeader.displayName = 'SongHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    opacity: 0.6,
  },
});

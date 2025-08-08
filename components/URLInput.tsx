import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface URLInputProps {
  onAnalyze: (query: string) => void;
  isLoading: boolean;
  onClear?: () => void;
  hasResult?: boolean;
}

export const SongInput = ({ onAnalyze, isLoading, onClear, hasResult }: URLInputProps) => {
  const [query, setQuery] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onAnalyze(query.trim());
    }
  }, [query, onAnalyze]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear?.();
  }, [onClear]);

  const isValidInput = query.trim().length > 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.label}>
        Search for Songs
      </ThemedText>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: backgroundColor,
              color: textColor,
              borderColor: isValidInput ? tintColor : '#ccc'
            }
          ]}
          value={query}
          onChangeText={setQuery}
          placeholder="Enter song name or artist..."
          placeholderTextColor="#999"
          multiline={false}
          editable={!isLoading}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setQuery('')}
            disabled={isLoading}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            {
              backgroundColor: isValidInput && !isLoading ? tintColor : '#ccc',
              opacity: isValidInput && !isLoading ? 1 : 0.6
            }
          ]}
          onPress={handleSearch}
          disabled={!isValidInput || isLoading}
        >
          <Ionicons 
            name={isLoading ? "hourglass" : "search"} 
            size={20} 
            color="white" 
            style={styles.buttonIcon} 
          />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Searching...' : 'Search Songs'}
          </ThemedText>
        </TouchableOpacity>

        {hasResult && (
          <TouchableOpacity
            style={[styles.clearResultButton, { borderColor: tintColor }]}
            onPress={handleClear}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color={tintColor} style={styles.buttonIcon} />
            <ThemedText style={[styles.clearButtonText, { color: tintColor }]}>
              Search New Song
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
    paddingRight: 45,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 15,
    padding: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearResultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

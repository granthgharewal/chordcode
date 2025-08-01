import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface UserInputProps {
  onAnalyze: (query: string) => void;
  isLoading: boolean;
  onClear?: () => void;
  hasResult?: boolean;
}

export const UserInput = ({ onAnalyze, isLoading, onClear, hasResult }: UserInputProps) => {
  const [query, setQuery] = useState('');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  // Animation values
  const buttonScale = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced theme colors with more soothing palette
  const inputBackground = useThemeColor(
    { light: '#ffffff', dark: '#2a2a2a' }, 
    'background'
  );
  const inputBorderColor = useThemeColor(
    { light: '#e1e5e9', dark: '#404040' }, 
    'text'
  );
  const placeholderColor = useThemeColor(
    { light: '#8e8e93', dark: '#8e8e93' }, 
    'text'
  );
  const disabledColor = useThemeColor(
    { light: '#d1d5db', dark: '#48484a' }, 
    'text'
  );

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      
      onAnalyze(query.trim());
    }
  }, [query, onAnalyze, buttonScale]);

  const handleInputFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleInputBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

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
        <Animated.View
          style={{
            borderColor: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [inputBorderColor, tintColor]
            }),
            borderWidth: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 3]
            }),
            borderRadius: 12,
          }}
        >
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: inputBackground,
                color: textColor,
                borderWidth: 0, // Remove default border since we're using Animated.View
              }
            ]}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter song name or artist..."
            placeholderTextColor={placeholderColor}
            multiline={false}
            editable={!isLoading}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </Animated.View>
        
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setQuery('')}
            disabled={isLoading}
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={isLoading ? disabledColor : placeholderColor} 
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              {
                backgroundColor: isValidInput && !isLoading ? tintColor : disabledColor,
                opacity: isValidInput && !isLoading ? 1 : 0.8
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
        </Animated.View>

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

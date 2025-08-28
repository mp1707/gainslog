import React, { useState, forwardRef, useRef, useEffect } from "react";
import { TextInput as RNTextInput, ViewStyle, View, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { AudioModule } from 'expo-audio';

// Create animated TextInput component
const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);
import { useTheme } from "@/theme";
import { createStyles } from "./TextInput.styles";
import { AudioTranscriptionButton } from "./AudioTranscriptionButton";
import { TranscriptionOverlay } from "./TranscriptionOverlay";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "number-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  autoExpand?: boolean;
  allowAudioTranscription?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      multiline = false,
      keyboardType = "default",
      autoCapitalize = "sentences",
      autoFocus = false,
      error = false,
      disabled = false,
      autoExpand = false,
      allowAudioTranscription = false,
      style,
      accessibilityLabel,
      accessibilityHint,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [liveTranscription, setLiveTranscription] = useState('');
    const { colors, colorScheme } = useTheme();
    const styles = createStyles(colors);
    
    // Refs for audio transcription
    const isRecordingRef = useRef(false);
    const baseTextRef = useRef('');
    
    // Animation values for autoExpand feature
    const heightAnimation = useSharedValue(44); // Start with single-line height

    // Animated style for height transitions
    const animatedHeightStyle = useAnimatedStyle(() => {
      return {
        height: heightAnimation.value,
      };
    }, []);

    // Speech recognition event handlers
    useSpeechRecognitionEvent('result', (event) => {
      if (!isRecordingRef.current) return;

      if (event.results && event.results.length > 0) {
        const latestResult = event.results[event.results.length - 1];
        const transcription = latestResult.transcript.trim();
        
        if (transcription) {
          setLiveTranscription(transcription);
        }
      }
    });

    useSpeechRecognitionEvent('error', (event) => {
      if (!isRecordingRef.current) return;

      console.error('Speech recognition error:', event.error);
      handleStopRecording();
      
      let errorMessage = 'Voice recognition failed. Please try again.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please speak clearly and try again.';
      } else if (event.error === 'network') {
        errorMessage = 'Network connection required for voice recognition.';
      }
      
      Alert.alert('Voice Recognition Error', errorMessage);
    });

    useSpeechRecognitionEvent('end', () => {
      if (isRecordingRef.current) {
        handleStopRecording();
      }
    });

    // Audio transcription methods
    const startRecording = async () => {
      try {
        setIsRecording(true);
        setLiveTranscription('');
        baseTextRef.current = value;

        // Request microphone permission
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Permission Required',
            'Please allow microphone access to use voice recording.'
          );
          setIsRecording(false);
          return;
        }

        // Request speech recognition permission
        const speechPermission = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
        if (!speechPermission.granted) {
          Alert.alert(
            'Permission Required',
            'Please allow speech recognition access for voice transcription.'
          );
          setIsRecording(false);
          return;
        }

        // Start real-time speech recognition
        await ExpoSpeechRecognitionModule.start({
          lang: 'de-DE',
          interimResults: true,
          maxAlternatives: 1,
          continuous: true,
        });

        isRecordingRef.current = true;
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start voice recording. Please try again.');
        setIsRecording(false);
      }
    };

    const handleStopRecording = async () => {
      try {
        if (isRecordingRef.current) {
          // Combine base text with transcription
          const finalText = baseTextRef.current.trim() 
            ? `${baseTextRef.current} ${liveTranscription.trim()}`
            : liveTranscription.trim();
          
          // Update the input with final transcription
          if (finalText !== baseTextRef.current) {
            onChangeText(finalText);
          }
          
          await ExpoSpeechRecognitionModule.stop();
          isRecordingRef.current = false;
        }
        
        setIsRecording(false);
        setLiveTranscription('');
        baseTextRef.current = '';
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setLiveTranscription('');
      }
    };

    const handleAudioTranscriptionPress = () => {
      if (disabled) return;
      
      if (isRecording) {
        handleStopRecording();
      } else {
        startRecording();
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (isRecordingRef.current) {
          handleStopRecording();
        }
      };
    }, []);

    // Get base styles
    const baseStyles: ViewStyle[] = [styles.base];

    // Add multiline styles
    if (multiline) {
      baseStyles.push(styles.multiline);
    }

    // Add focus styles
    if (isFocused && !disabled) {
      baseStyles.push(styles.focused);
    }

    // Add error styles
    if (error && !disabled) {
      baseStyles.push(styles.error);
    }

    // Add disabled styles
    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    // Add custom styles
    if (style) {
      baseStyles.push(style as ViewStyle);
    }

    const handleFocus = (e: any) => {
      setIsFocused(true);
      
      // Handle autoExpand animation
      if (autoExpand && !multiline) {
        setIsExpanded(true);
        heightAnimation.value = withTiming(100, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }
      
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      
      // Handle autoExpand animation
      if (autoExpand && !multiline) {
        setIsExpanded(false);
        heightAnimation.value = withTiming(44, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }
      
      onBlur?.(e);
    };

    // Determine if we should use multiline behavior (original multiline prop or expanded state)
    const shouldUseMultiline = multiline || (autoExpand && isExpanded);
    
    return (
      <>
        <View style={{ position: 'relative' }}>
          <AnimatedTextInput
            ref={ref}
            style={[baseStyles, autoExpand && !multiline && animatedHeightStyle]}
            placeholderTextColor={colors.secondaryText}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            keyboardAppearance={colorScheme}
            multiline={shouldUseMultiline}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            textAlignVertical={shouldUseMultiline ? "top" : "center"}
            numberOfLines={shouldUseMultiline ? 4 : 1}
            editable={!disabled}
            selectTextOnFocus={!disabled}
            returnKeyType={shouldUseMultiline ? "default" : "done"}
            blurOnSubmit={!shouldUseMultiline}
            // Accessibility
            accessibilityLabel={accessibilityLabel || placeholder}
            accessibilityHint={accessibilityHint}
            accessibilityState={{
              disabled,
              selected: isFocused,
              expanded: shouldUseMultiline,
            }}
            accessible={true}
          />
          
          {/* Audio Transcription Button */}
          {allowAudioTranscription && !disabled && (
            <AudioTranscriptionButton
              isMultiline={shouldUseMultiline}
              isRecording={isRecording}
              onPress={handleAudioTranscriptionPress}
            />
          )}
        </View>

        {/* Transcription Overlay */}
        {allowAudioTranscription && (
          <TranscriptionOverlay
            visible={isRecording}
            liveTranscription={liveTranscription}
            onStop={handleStopRecording}
          />
        )}
      </>
    );
  }
);

TextInput.displayName = "TextInput";

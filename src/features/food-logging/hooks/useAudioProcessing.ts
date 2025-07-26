import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { FoodLog } from '@/types';
import { useCreateFoodLog } from './useCreateFoodLog';

export interface UseAudioProcessingReturn {
  isProcessing: boolean;
  isRecognizing: boolean;
  transcript: string;
  startRealTimeRecognition: () => Promise<void>;
  stopRealTimeRecognition: () => Promise<string>;
  processTranscript: (transcript: string) => Promise<void>;
}

/**
 * Custom hook for real-time speech recognition during audio recording
 * and creating food logs from the transcribed text
 */
export function useAudioProcessing(): UseAudioProcessingReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { create } = useCreateFoodLog();
  const transcriptRef = useRef<string>('');

  // Speech recognition event handlers
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started');
    setIsRecognizing(true);
    setTranscript('');
    transcriptRef.current = '';
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech recognition ended');
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event);
    setIsRecognizing(false);
    Alert.alert(
      'Speech Recognition Error',
      'Failed to recognize speech. Please try again.',
      [{ text: 'OK' }]
    );
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results?.transcript) {
      const newTranscript = event.results.transcript;
      setTranscript(newTranscript);
      transcriptRef.current = newTranscript;
      console.log('Speech recognition result:', newTranscript);
    }
  });

  const startRealTimeRecognition = useCallback(async () => {
    try {
      // Request permissions
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow speech recognition access to transcribe your voice.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start recognition
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        requiresOnDeviceRecognition: true,
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Alert.alert(
        'Recognition Error',
        'Failed to start speech recognition. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const stopRealTimeRecognition = useCallback(async (): Promise<string> => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      // Return the final transcript
      return transcriptRef.current;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      return transcriptRef.current;
    }
  }, []);

  const processTranscript = useCallback(
    async (finalTranscript: string) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);

        if (!finalTranscript || finalTranscript.trim().length === 0) {
          Alert.alert(
            'No Speech Detected',
            'Could not detect any speech. Please try speaking more clearly.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Create food log with transcription and trigger AI estimation
        const timestamp = Date.now().toString();
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const foodLog: FoodLog = {
          id: timestamp,
          userDescription: finalTranscript.trim(),
          generatedTitle: 'Audio description', // Will be updated by AI
          estimationConfidence: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          createdAt: new Date().toISOString(),
          date,
          needsAiEstimation: true,
          isAudioTranscript: true,
        };

        // Use existing food log creation pipeline
        await create(foodLog);

      } catch (error) {
        console.error('Error processing transcript:', error);
        Alert.alert(
          'Processing Error',
          'Failed to process the transcript. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsProcessing(false);
        setTranscript('');
        transcriptRef.current = '';
      }
    },
    [isProcessing, create]
  );

  return {
    isProcessing,
    isRecognizing,
    transcript,
    startRealTimeRecognition,
    stopRealTimeRecognition,
    processTranscript,
  };
}
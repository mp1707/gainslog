import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { AudioModule } from 'expo-audio';

type RecordingState = 'recording' | 'idle';

export interface UseAudioRecordingReturn {
  recordingState: RecordingState;
  liveTranscription: string;
  startRecording: () => Promise<void>;
  handleStopRecording: () => Promise<void>;
  startNewRecording: () => Promise<void>;
  isRecording: boolean;
  setBaseDescription: (description: string) => void;
  getCurrentTranscription: () => string;
  setOnTranscriptionComplete: (callback: (transcription: string) => void) => void;
}

/**
 * Custom hook for managing audio recording and speech recognition
 * Handles permissions, live transcription, and recording state
 */
export function useAudioRecording(): UseAudioRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [liveTranscription, setLiveTranscription] = useState('');
  const isRecording = useRef(false);
  const baseDescriptionRef = useRef(''); // Track base description before recording
  const onTranscriptionCompleteRef = useRef<((transcription: string) => void) | null>(null);

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    if (!isRecording.current) return;

    if (event.results && event.results.length > 0) {
      // Get the latest transcription result
      const latestResult = event.results[event.results.length - 1];
      const transcription = latestResult.transcript.trim();
      
      if (transcription) {
        // Always show live transcription feedback
        setLiveTranscription(transcription);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!isRecording.current) return;

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
    if (isRecording.current) {
      // When recognition ends, save the current transcription as final
      if (liveTranscription.trim()) {
        const finalText = baseDescriptionRef.current.trim() 
          ? `${baseDescriptionRef.current} ${liveTranscription.trim()}`
          : liveTranscription.trim();
        
        // Update the base description with final results
        baseDescriptionRef.current = finalText;
      }
      handleStopRecording();
    }
  });

  const startRecording = async () => {
    try {
      setRecordingState('recording');
      setLiveTranscription('');

      // Request microphone permission
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to use voice recording.'
        );
        setRecordingState('idle');
        return;
      }

      // Request speech recognition permission
      const speechPermission = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!speechPermission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow speech recognition access for voice transcription.'
        );
        setRecordingState('idle');
        return;
      }

      // Start real-time speech recognition
      await ExpoSpeechRecognitionModule.start({
        lang: 'de-DE', // Could be made configurable
        interimResults: true, // Enable for live feedback
        maxAlternatives: 1,
        continuous: true,
      });

      isRecording.current = true;
      setRecordingState('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
      setRecordingState('idle');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (isRecording.current) {
        // Before stopping, capture any current transcription as final
        if (liveTranscription.trim()) {
          const finalText = baseDescriptionRef.current.trim() 
            ? `${baseDescriptionRef.current} ${liveTranscription.trim()}`
            : liveTranscription.trim();
          
          // Update the base description
          baseDescriptionRef.current = finalText;
          
          // Notify form state of final transcription
          if (onTranscriptionCompleteRef.current) {
            onTranscriptionCompleteRef.current(finalText);
          }
        }
        
        await ExpoSpeechRecognitionModule.stop();
        isRecording.current = false;
      }
      setRecordingState('idle');
      setLiveTranscription('');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const startNewRecording = async () => {
    // For the inline record button - append to existing description
    if (recordingState === 'recording') {
      handleStopRecording();
    } else {
      await startRecording();
    }
  };

  const setBaseDescription = (description: string) => {
    baseDescriptionRef.current = description;
  };

  const getCurrentTranscription = (): string => {
    if (recordingState === 'recording' && liveTranscription.trim()) {
      // Return combined text for live feedback
      return baseDescriptionRef.current.trim() 
        ? `${baseDescriptionRef.current} ${liveTranscription}`
        : liveTranscription;
    }
    return baseDescriptionRef.current;
  };

  const setOnTranscriptionComplete = (callback: (transcription: string) => void) => {
    onTranscriptionCompleteRef.current = callback;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording.current) {
        handleStopRecording();
      }
    };
  }, []);

  return {
    recordingState,
    liveTranscription,
    startRecording,
    handleStopRecording,
    startNewRecording,
    isRecording: recordingState === 'recording',
    setBaseDescription,
    getCurrentTranscription,
    setOnTranscriptionComplete,
  };
}
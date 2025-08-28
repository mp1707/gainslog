import { useState, useRef, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { AudioModule } from 'expo-audio';

export interface UseAudioTranscriptionProps {
  onTranscriptionComplete: (text: string) => void;
  initialValue: string;
  disabled?: boolean;
}

export interface UseAudioTranscriptionReturn {
  isRecording: boolean;
  liveTranscription: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleRecording: () => void;
}

export const useAudioTranscription = ({
  onTranscriptionComplete,
  initialValue,
  disabled = false,
}: UseAudioTranscriptionProps): UseAudioTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  
  // Refs to avoid stale closures
  const isRecordingRef = useRef(false);
  const baseTextRef = useRef('');
  const liveTranscriptionRef = useRef('');

  // Memoized handlers to prevent re-registration of event listeners
  const handleResult = useCallback((event: any) => {
    if (!isRecordingRef.current) return;

    if (event.results && event.results.length > 0) {
      const latestResult = event.results[event.results.length - 1];
      const transcription = latestResult.transcript.trim();
      
      if (transcription) {
        setLiveTranscription(transcription);
        liveTranscriptionRef.current = transcription;
      }
    }
  }, []);

  const handleError = useCallback((event: any) => {
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
  }, []);

  const handleEnd = useCallback(() => {
    // Do nothing - let the user control when to stop recording
    // This prevents automatic stopping during natural speech pauses
  }, []);

  // Speech recognition event listeners
  useSpeechRecognitionEvent('result', handleResult);
  useSpeechRecognitionEvent('error', handleError);
  useSpeechRecognitionEvent('end', handleEnd);

  const startRecording = useCallback(async (): Promise<void> => {
    if (disabled) return;
    
    try {
      setIsRecording(true);
      setLiveTranscription('');
      baseTextRef.current = initialValue;

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
      isRecordingRef.current = false;
    }
  }, [disabled, initialValue]);

  const handleStopRecording = useCallback(async (): Promise<void> => {
    try {
      if (isRecordingRef.current) {
        // Use ref to avoid stale closure - combine base text with transcription
        const currentTranscription = liveTranscriptionRef.current;
        const finalText = baseTextRef.current.trim() 
          ? `${baseTextRef.current} ${currentTranscription.trim()}`
          : currentTranscription.trim();
        
        // Update the input with final transcription
        if (finalText && finalText !== baseTextRef.current) {
          onTranscriptionComplete(finalText);
        }
        
        await ExpoSpeechRecognitionModule.stop();
        isRecordingRef.current = false;
      }
      
      setIsRecording(false);
      setLiveTranscription('');
      liveTranscriptionRef.current = '';
      baseTextRef.current = '';
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setLiveTranscription('');
      liveTranscriptionRef.current = '';
    }
  }, [onTranscriptionComplete]);

  const stopRecording = useCallback(async (): Promise<void> => {
    await handleStopRecording();
  }, [handleStopRecording]);

  const toggleRecording = useCallback((): void => {
    if (disabled) return;
    
    if (isRecording) {
      handleStopRecording();
    } else {
      startRecording();
    }
  }, [disabled, isRecording, handleStopRecording, startRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecordingRef.current) {
        handleStopRecording();
      }
    };
  }, [handleStopRecording]);

  return {
    isRecording,
    liveTranscription,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
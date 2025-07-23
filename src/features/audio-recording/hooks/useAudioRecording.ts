import { useState, useEffect } from 'react';
import { Alert, Animated } from 'react-native';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { FoodLog } from '../../../types';
import { generateFoodLogId } from '../../../lib/storage';

export const useAudioRecording = () => {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  // Request permissions on initialization
  useEffect(() => {
    const requestAudioPermissions = async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          'Permission Required',
          'Microphone access is needed to record audio'
        );
      }
    };
    requestAudioPermissions();
  }, []);

  // Handle pulse animation for recording modal
  useEffect(() => {
    if (showRecordingModal) {
      const pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationLoop.start();

      return () => {
        pulseAnimationLoop.stop();
      };
    } else {
      pulseAnimation.setValue(1);
    }
  }, [showRecordingModal, pulseAnimation]);

  const startRecording = async () => {
    try {
      console.log('Starting audio recording...');
      setRecordingDuration(0);
      setHasRecorded(false);
      setShowRecordingModal(true);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log('Recording started, isRecording:', audioRecorder.isRecording);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setShowRecordingModal(false);
      Alert.alert('Error', `Failed to start recording: ${error}`);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping audio recording...');
      setShowRecordingModal(false);
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
        setHasRecorded(true);
        console.log('Recording stopped successfully');
      } else {
        console.warn('Attempted to stop recording when not recording');
        setHasRecorded(true);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', `Failed to stop recording: ${error}`);
    }
  };

  const sendRecording = async (): Promise<FoodLog | null> => {
    try {
      setIsProcessingAudio(true);

      // Note: Audio processing with OpenAI would go here
      // For now, create a placeholder log that suggests manual entry
      const newLog: FoodLog = {
        id: generateFoodLogId(),
        generatedTitle: 'Audio recording - please add details',
        estimationConfidence: 20,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        createdAt: new Date().toISOString(),
      };

      // DON'T save to storage here - let App.tsx handle it consistently
      // await saveFoodLog(newLog);

      // Reset recording state
      setHasRecorded(false);
      setRecordingDuration(0);
      
      Alert.alert(
        'Audio Recorded', 
        'Please tap \'Add Info\' to add food details for better nutrition estimates.'
      );

      return newLog;
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Error', 'Failed to process audio recording');
      return null;
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const cancelRecording = () => {
    setHasRecorded(false);
    setRecordingDuration(0);
    setShowRecordingModal(false);
  };

  // Safety function to reset recording state if stuck
  const resetRecordingState = async () => {
    try {
      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }
      setHasRecorded(false);
      setRecordingDuration(0);
      setIsProcessingAudio(false);
      setShowRecordingModal(false);
      console.log('Recording state reset');
    } catch (error) {
      console.error('Error resetting recording state:', error);
    }
  };

  return {
    hasRecorded,
    isProcessingAudio,
    recordingDuration,
    pulseAnimation,
    showRecordingModal,
    startRecording,
    stopRecording,
    sendRecording,
    cancelRecording,
    resetRecordingState,
  };
};
import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence
} from 'react-native-reanimated';
import { AudioPlayer } from '../../atoms/AudioPlayer';
import { styles } from './AudioRecordingModal.styles';

type RecordingState = 'preparing' | 'recording' | 'recorded' | 'playing';

interface AudioRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onSend?: (audioUri: string) => void;
}

export function AudioRecordingModal({ 
  visible, 
  onClose, 
  onSend 
}: AudioRecordingModalProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recordingState, setRecordingState] = useState<RecordingState>('preparing');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimation = useSharedValue(1);

  // Auto-start recording when modal opens and cleanup on close
  useEffect(() => {
    if (visible) {
      startRecording();
    } else {
      handleResourceCleanup();
    }
  }, [visible]);

  // Recording timer - only start when actually recording
  useEffect(() => {
    // Clear any existing timer first
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    
    // Only start timer when actually recording (not preparing)
    if (recordingState === 'recording') {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    };
  }, [recordingState]);

  // Pulse animation for recording state
  useEffect(() => {
    if (recordingState === 'recording') {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [recordingState]);

  const animatedRecordingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const startRecording = async () => {
    try {
      setRecordingState('preparing');
      setRecordingTime(0);
      
      // Request permissions using expo-audio
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(
          'Permission Required', 
          'Please allow microphone access to record audio.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      // Set audio mode for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      
      // Only set recording state after everything is ready
      setRecordingState('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecordingState('preparing');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      if (uri) {
        setRecordedUri(uri);
        setRecordingState('recorded');
      } else {
        Alert.alert('Error', 'Failed to save recording. Please try again.');
        handleReset();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      handleReset();
    }
  };

  const handleResourceCleanup = async () => {
    try {
      // Stop any active recording
      if (recordingState === 'recording') {
        await audioRecorder.stop();
      }
      
      // Delete recorded file if it exists
      if (recordedUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(recordedUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(recordedUri);
          }
        } catch (deleteError) {
          console.warn('Failed to delete audio file:', deleteError);
        }
      }
      
      // Clear timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      // Stop pulse animation
      pulseAnimation.value = 1;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const handleCompleteCleanup = async () => {
    await handleResourceCleanup();
    
    // Reset all state
    setRecordingState('preparing');
    setRecordingTime(0);
    setRecordedUri(null);
    setIsPlaying(false);
  };

  const handleReset = () => {
    handleCompleteCleanup();
  };

  const handleDelete = async () => {
    await handleResourceCleanup();
    onClose();
  };

  const handleSend = () => {
    if (recordedUri && onSend) {
      onSend(recordedUri);
    }
    onClose();
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderRecordingControls = () => {
    switch (recordingState) {
      case 'preparing':
        return (
          <View style={styles.controlsContainer}>
            <View style={styles.recordingButton}>
              <FontAwesome name="microphone" size={32} color="white" />
            </View>
            <Text style={styles.recordingText}>Preparing...</Text>
          </View>
        );

      case 'recording':
        return (
          <View style={styles.controlsContainer}>
            <Animated.View style={[styles.recordingButton, animatedRecordingStyle]}>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Stop recording"
              >
                <FontAwesome name="stop" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
            
            <View style={styles.recordingInfo}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          </View>
        );

      case 'recorded':
      case 'playing':
        return (
          <View style={styles.controlsContainer}>
            {recordedUri && (
              <AudioPlayer
                audioUri={recordedUri}
                onPlayStateChange={setIsPlaying}
                size="large"
              />
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Delete recording"
              >
                <FontAwesome name="trash" size={20} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Send recording"
              >
                <FontAwesome name="send" size={20} color="white" />
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={async () => {
        await handleResourceCleanup();
        onClose();
      }}
    >
      <StatusBar style="light" />
      <Pressable 
        style={styles.backdrop}
        onPress={async () => {
          await handleResourceCleanup();
          onClose();
        }}
      >
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            {renderRecordingControls()}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
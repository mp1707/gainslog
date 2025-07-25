import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
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

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

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
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimation = useSharedValue(1);

  // Cleanup on modal close
  useEffect(() => {
    if (!visible) {
      handleReset();
    }
  }, [visible]);

  // Recording timer
  useEffect(() => {
    if (recordingState === 'recording') {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
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
      audioRecorder.record();
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
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

  const handleReset = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    setRecordedUri(null);
    setIsPlaying(false);
    
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleReset }
      ]
    );
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
      case 'idle':
        return (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Start recording"
            >
              <FontAwesome name="microphone" size={32} color="white" />
            </TouchableOpacity>
            <Text style={styles.instructionText}>Tap to start recording</Text>
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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Record Audio</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderRecordingControls()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
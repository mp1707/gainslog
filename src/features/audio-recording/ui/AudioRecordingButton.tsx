import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Button, LoadingSpinner } from '@/shared/ui';
import { useAudioRecording } from '../hooks';
import { RecordingModal } from './RecordingModal';
import { FoodLog } from '../../../types';
import { styles } from './AudioRecordingButton.styles';

interface AudioRecordingButtonProps {
  onAudioRecorded: (log: FoodLog) => void;
}

export const AudioRecordingButton: React.FC<AudioRecordingButtonProps> = ({
  onAudioRecorded,
}) => {
  const {
    hasRecorded,
    isProcessingAudio,
    pulseAnimation,
    showRecordingModal,
    startRecording,
    stopRecording,
    sendRecording,
    cancelRecording,
    resetRecordingState,
  } = useAudioRecording();

  const handleSend = async () => {
    const log = await sendRecording();
    if (log) {
      onAudioRecorded(log);
    }
  };

  // Recording button (shows when not recorded and not processing)
  if (!hasRecorded && !isProcessingAudio && !showRecordingModal) {
    return (
      <>
        <View style={styles.recordButton}>
          <Button
            onPress={startRecording}
            variant="danger"
            size="medium"
          >
            🎤
          </Button>
        </View>
        <RecordingModal
          visible={showRecordingModal}
          pulseAnimation={pulseAnimation}
          onStop={stopRecording}
        />
      </>
    );
  }

  // Recording actions (cancel/send) when recording is done
  if (hasRecorded && !isProcessingAudio) {
    return (
      <>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={cancelRecording}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={handleSend}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Reset - show if stuck in recording state */}
        <View style={styles.emergencyResetContainer}>
          <TouchableOpacity
            style={styles.emergencyResetButton}
            onPress={resetRecordingState}
          >
            <Text style={styles.emergencyResetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        
        <RecordingModal
          visible={showRecordingModal}
          pulseAnimation={pulseAnimation}
          onStop={stopRecording}
        />
      </>
    );
  }

  // Processing state
  if (isProcessingAudio) {
    return (
      <View style={styles.processingButton}>
        <View style={styles.processingContent}>
          <LoadingSpinner color="#ffffff" size="small" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      </View>
    );
  }

  return (
    <RecordingModal
      visible={showRecordingModal}
      pulseAnimation={pulseAnimation}
      onStop={stopRecording}
    />
  );
};
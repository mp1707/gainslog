import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { styles } from './RecordingModal.styles';

interface RecordingModalProps {
  visible: boolean;
  pulseAnimation: Animated.Value;
  onStop: () => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  pulseAnimation,
  onStop,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onStop}
      supportedOrientations={['portrait']}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.recordingDot,
              { transform: [{ scale: pulseAnimation }] },
            ]}
          />
          <Text style={styles.title}>Recording...</Text>
          <Text style={styles.timer}>00:00</Text>

          <TouchableOpacity style={styles.stopButton} onPress={onStop}>
            <Text style={styles.stopButtonText}>⏹</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Tap to stop recording</Text>
        </View>
      </View>
    </Modal>
  );
};
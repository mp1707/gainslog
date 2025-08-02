import React, { useEffect } from 'react';
import { Modal, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { FoodLog, ModalMode } from '../../../types';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';
import { useStyles } from './FoodLogModal.styles';
import { ModalHeader } from './components/ModalHeader';
import { FoodImageDisplay } from './components/FoodImageDisplay';
import { FoodLogFormFields } from './components/FoodLogFormFields';
import { useFoodLogForm } from './hooks/useFoodLogForm';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useFoodLogValidation } from './hooks/useFoodLogValidation';

interface FoodLogModalProps {
  visible: boolean;
  mode: ModalMode;
  selectedLog: FoodLog | null;
  onClose: (wasSaved?: boolean) => void;
  onSave: (log: FoodLog) => void;
  isAudioMode?: boolean;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  visible,
  mode,
  selectedLog,
  onClose,
  onSave,
  isAudioMode = false,
}) => {
  const styles = useStyles();
  const { foodLogs } = useFoodLogStore();
  
  // Get the live log from store to reflect upload progress
  const currentLog = selectedLog ? foodLogs.find(log => log.id === selectedLog.id) || selectedLog : selectedLog;
  
  // Custom hooks for state and logic management
  const form = useFoodLogForm();
  const audioRecording = useAudioRecording();
  const validation = useFoodLogValidation();

  // Set up transcription completion callback
  useEffect(() => {
    audioRecording.setOnTranscriptionComplete((transcription) => {
      form.updateField('description', transcription);
    });
  }, []);

  // Auto-start recording when modal opens in audio mode
  useEffect(() => {
    if (visible && isAudioMode) {
      // Set base description to current value when starting audio mode
      audioRecording.setBaseDescription(form.formData.description);
      audioRecording.startRecording();
    } else if (!visible) {
      // Clean up when modal closes
      if (audioRecording.isRecording) {
        audioRecording.handleStopRecording();
      }
    }
  }, [visible, isAudioMode]);

  // Reset form when modal opens or when currentLog changes (e.g., transcription completes)
  useEffect(() => {
    if (visible) {
      form.initializeForm(currentLog, mode);
      // Reset audio recording state
      if (mode === 'create' && !currentLog) {
        audioRecording.setBaseDescription('');
      }
    }
  }, [visible, currentLog, mode]);

  // Sync audio transcription with form description
  useEffect(() => {
    if (audioRecording.recordingState === 'recording') {
      // Set the base description when starting recording
      audioRecording.setBaseDescription(form.formData.description);
    }
  }, [audioRecording.recordingState]);

  const handleSave = () => {
    const result = validation.validateAndCreateLog(form.formData, currentLog, mode);
    
    if (!result.isValid) {
      if (result.error) {
        form.setValidationError(result.error);
      }
      return;
    }

    if (result.log) {
      // Close modal immediately and let parent handle AI processing
      onSave(result.log);
      onClose(true); // Pass true to indicate this was a save action
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => onClose(false)} // Pass false for system close
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <ModalHeader
          mode={mode}
          isUploading={currentLog?.isUploading}
          onCancel={() => onClose(false)} // Pass false to indicate cancel
          onSave={handleSave}
        />

        {form.validationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{form.validationError}</Text>
          </View>
        )}

        <KeyboardAwareScrollView 
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          bottomOffset={20}
          showsVerticalScrollIndicator={false}
        >
          {currentLog && (
            <FoodImageDisplay log={currentLog} />
          )}

          <FoodLogFormFields
            formData={form.formData}
            currentLog={currentLog}
            audioRecording={audioRecording}
            onFieldChange={form.updateField}
            onValidationErrorClear={() => form.setValidationError('')}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
  );
};
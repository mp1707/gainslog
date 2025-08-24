import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  InteractionManager,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LegacyFoodLog, ModalMode } from "src/types-legacy/indexLegacy";
import {
  useFoodLogStore,
  selectFoodLogs,
} from "src/store-legacy/useFoodLogStore";
import { useStyles } from "./FoodLogModal.styles";
import { ModalHeader } from "../ModalHeader";
import { FoodImageDisplay } from "../FoodImageDisplay";
import { FoodLogFormFields } from "../FoodLogFormFields";
import { useFoodLogForm } from "../../../hooks/useFoodLogForm";
import { useAudioRecording } from "../../../hooks/useAudioRecording";
import { useFoodLogValidation } from "../../../hooks/useFoodLogValidation";

export type NutritionMode = "estimation" | "manual";

interface FoodLogModalProps {
  visible: boolean;
  mode: ModalMode;
  selectedLog: LegacyFoodLog | null;
  onClose: (wasSaved?: boolean) => void;
  onSave: (log: LegacyFoodLog) => void;
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
  const foodLogs = useFoodLogStore(selectFoodLogs);
  const titleInputRef = useRef<any>(null);

  // Nutrition mode state - defaults to estimation
  const [nutritionMode, setNutritionMode] =
    useState<NutritionMode>("estimation");

  // Get the live log from store to reflect upload progress
  const currentLog = selectedLog
    ? foodLogs.find((log) => log.id === selectedLog.id) || selectedLog
    : selectedLog;

  // Custom hooks for state and logic management
  const form = useFoodLogForm();
  const audioRecording = useAudioRecording();
  const validation = useFoodLogValidation();

  // Handle nutrition mode toggle change
  const handleNutritionModeChange = (mode: NutritionMode) => {
    setNutritionMode(mode);

    // Clear nutrition fields when switching from manual to estimation
    if (mode === "estimation") {
      form.clearNutritionFields();
    }
  };

  // Set up transcription completion callback
  useEffect(() => {
    audioRecording.setOnTranscriptionComplete((transcription) => {
      form.updateField("description", transcription);
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

  // Focus the title input when opening the modal (non-audio mode)
  useEffect(() => {
    if (!visible || isAudioMode) {
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      // Delay to allow the modal animation and keyboard layout to fully settle
      setTimeout(() => titleInputRef.current?.focus?.(), 250);
    });
    return () => {
      task?.cancel?.();
    };
  }, [visible, isAudioMode]);

  // Reset form when modal opens or when currentLog changes (e.g., transcription completes)
  useEffect(() => {
    if (visible) {
      form.initializeForm(currentLog, mode);
      // Always reset nutrition mode to estimation when modal opens
      setNutritionMode("estimation");
      // Reset audio recording state for new logs
      if (mode === "create" && !currentLog) {
        audioRecording.setBaseDescription("");
      }
    }
  }, [visible, currentLog, mode]);

  // Sync audio transcription with form description
  useEffect(() => {
    if (audioRecording.recordingState === "recording") {
      // Set the base description when starting recording
      audioRecording.setBaseDescription(form.formData.description);
    }
  }, [audioRecording.recordingState]);

  const handleSave = () => {
    const result = validation.validateAndCreateLog(
      form.formData,
      currentLog,
      mode
    );

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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={72} // Account for modal header height
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

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentLog && <FoodImageDisplay log={currentLog} />}

            <FoodLogFormFields
              formData={form.formData}
              currentLog={currentLog}
              audioRecording={audioRecording}
              nutritionMode={nutritionMode}
              onFieldChange={form.updateField}
              onValidationErrorClear={() => form.setValidationError("")}
              onNutritionModeChange={handleNutritionModeChange}
              titleInputRef={titleInputRef}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

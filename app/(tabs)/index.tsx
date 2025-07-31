import React, { useEffect, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FoodLogScreen, FoodLogModal } from "../../src/features/food-logging";
import { AudioRecordingModal } from "../../src/shared/ui";
import { useFoodLogModal, useUpdateFoodLog } from "../../src/features/food-logging/hooks";
import { useCreateFoodLog } from "../../src/features/food-logging/hooks/useCreateFoodLog";
import { useImageCapture } from "../../src/features/image-capture/hooks/useImageCapture";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";

export default function TodayTab() {
  // Global store for logs & trigger state
  const {
    isLoadingLogs,
    deleteFoodLogById,
    triggerAction,
    clearTrigger,
    loadFoodLogs,
  } = useFoodLogStore();

  // Audio recording modal state
  const [isAudioModalVisible, setIsAudioModalVisible] = useState(false);

  /* UI hooks */
  const modal = useFoodLogModal();
  const { create } = useCreateFoodLog();
  const { update } = useUpdateFoodLog();
  const { launchCamera, launchImageLibrary } = useImageCapture();

  // Load logs on mount
  useEffect(() => {
    loadFoodLogs();
  }, [loadFoodLogs]);

  /* Respond to global +-button triggers */
  useEffect(() => {
    if (!triggerAction) return;

    const handle = async () => {
      if (triggerAction === "manual") {
        modal.handleManualLog();
      } else if (triggerAction === "camera") {
        const log = await launchCamera();
        if (log) {
          modal.handleImageCaptured(log);
        }
      } else if (triggerAction === "library") {
        const log = await launchImageLibrary();
        if (log) {
          modal.handleImageCaptured(log);
        }
      } else if (triggerAction === "audio") {
        setIsAudioModalVisible(true);
      }
      clearTrigger();
    };

    handle();
  }, [triggerAction]);

  /* Modal save handler */
  const handleSave = useCallback(
    async (log) => {
      if (modal.modalMode === 'edit') {
        await update(log);
      } else {
        await create(log);
      }
    },
    [create, update, modal.modalMode]
  );

  /* Audio recording handlers */
  const handleAudioModalClose = useCallback(() => {
    setIsAudioModalVisible(false);
  }, []);

  // Audio transcription state
  const [currentAudioLogId, setCurrentAudioLogId] = useState<string | null>(null);
  
  const handleAudioTranscriptionStart = useCallback(() => {
    // Helper function to get today's date in ISO format (YYYY-MM-DD) in local timezone
    const getTodayDateString = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    
    // Create incomplete food log object - transcription in progress
    const newId = `food_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog = {
      id: newId,
      generatedTitle: 'Audio Entry', // Cleaner title, will be overridden by AI
      estimationConfidence: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      userDescription: '', // Empty while transcribing
      userTitle: undefined,
      userCalories: undefined,
      userProtein: undefined,
      userCarbs: undefined,
      userFat: undefined,
      createdAt: new Date().toISOString(),
      date: getTodayDateString(),
      needsAiEstimation: true, // This is crucial - triggers AI processing
      isTranscribing: true, // Show skeleton while transcribing
    };
    
    // Store the ID for later update
    setCurrentAudioLogId(newId);
    
    // Close audio modal and immediately open food log modal
    setIsAudioModalVisible(false);
    
    // Small delay to prevent race condition with modal transitions
    setTimeout(() => {
      modal.handleAudioTranscribed(newLog);
    }, 100);
  }, [modal]);

  const handleAudioTranscriptionComplete = useCallback(async (transcribedText: string) => {
    if (!currentAudioLogId) return;
    
    // Update the existing log with transcribed text
    const updatedLog = modal.selectedLog ? {
      ...modal.selectedLog,
      userDescription: transcribedText,
      isTranscribing: false, // Hide skeleton, show text
    } : null;
    
    if (updatedLog) {
      modal.setSelectedLog(updatedLog);
    }
    
    setCurrentAudioLogId(null);
  }, [modal, currentAudioLogId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FoodLogScreen
        isLoadingLogs={isLoadingLogs}
        onDeleteLog={deleteFoodLogById}
        onAddInfo={modal.handleAddInfo}
      />

      <FoodLogModal
        visible={modal.isModalVisible}
        mode={modal.modalMode}
        selectedLog={modal.selectedLog}
        onClose={modal.handleModalClose}
        onSave={handleSave}
      />

      <AudioRecordingModal
        visible={isAudioModalVisible}
        onClose={handleAudioModalClose}
        onTranscriptionStart={handleAudioTranscriptionStart}
        onTranscriptionComplete={handleAudioTranscriptionComplete}
      />
    </GestureHandlerRootView>
  );
}

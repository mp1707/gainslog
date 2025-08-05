import React, { useEffect, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native";
import { FoodLogScreen, FoodLogModal } from "../../src/features/food-logging";
import {
  useFoodLogModal,
  useUpdateFoodLog,
} from "../../src/features/food-logging/hooks";
import { useCreateFoodLog } from "../../src/features/food-logging/hooks/useCreateFoodLog";
import { useImageCapture } from "../../src/features/image-capture/hooks/useImageCapture";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { useKeyboardOffset } from "../../src/features/settings/hooks/useKeyboardOffset";

export default function TodayTab() {
  // Global store for logs & trigger state
  const {
    isLoadingLogs,
    deleteFoodLogById,
    triggerAction,
    clearTrigger,
    loadFoodLogs,
  } = useFoodLogStore();

  const keyboardOffset = useKeyboardOffset(true); // true because we have a tab bar

  // State to trigger scroll to top after save
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // Callback for immediate scroll on save-close
  const handleSaveClose = useCallback(() => {
    setShouldScrollToTop(true);
  }, []);

  /* UI hooks */
  const modal = useFoodLogModal(handleSaveClose);
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
        // Directly open FoodLogModal in audio mode
        modal.handleAudioLog();
      }
      clearTrigger();
    };

    handle();
  }, [triggerAction]);

  /* Modal save handler */
  const handleSave = useCallback(
    async (log: any) => {
      if (modal.modalMode === "edit") {
        await update(log);
      } else {
        await create(log);
      }
      // Note: Scroll trigger now happens immediately when modal closes, not here
    },
    [create, update, modal.modalMode]
  );

  // Reset scroll trigger after it's been processed
  useEffect(() => {
    if (shouldScrollToTop) {
      // Reset the flag after a brief delay to ensure the scroll happens
      const timer = setTimeout(() => {
        setShouldScrollToTop(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToTop]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={keyboardOffset}
      >
        <FoodLogScreen
          isLoadingLogs={isLoadingLogs}
          onDeleteLog={deleteFoodLogById}
          onAddInfo={modal.handleAddInfo}
          scrollToTop={shouldScrollToTop}
        />
      </KeyboardAvoidingView>

      <FoodLogModal
        visible={modal.isModalVisible}
        mode={modal.modalMode}
        selectedLog={modal.selectedLog}
        onClose={modal.handleModalClose}
        onSave={handleSave}
        isAudioMode={modal.isAudioMode}
      />
    </GestureHandlerRootView>
  );
}

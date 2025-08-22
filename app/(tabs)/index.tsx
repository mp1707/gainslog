import React, { useEffect, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native";
import { FoodLogScreen, FoodLogModal } from "@/features/food-logging";
import {
  useFoodLogModal,
  useUpdateFoodLog,
} from "@/features/food-logging/hooks";
import { useCreateFoodLog } from "@/features/food-logging/hooks/useCreateFoodLog";
import { useImageCapture } from "@/features/image-capture/hooks/useImageCapture";
import {
  useFoodLogStore,
  selectIsLoadingLogs,
  selectTriggerAction,
} from "src/stores/useFoodLogStore";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";

export default function TodayTab() {
  // Global store for logs & trigger state
  const isLoadingLogs = useFoodLogStore(selectIsLoadingLogs);
  const triggerAction = useFoodLogStore(selectTriggerAction);
  const clearTrigger = useFoodLogStore((state) => state.clearTrigger);
  const loadFoodLogs = useFoodLogStore((state) => state.loadFoodLogs);
  const deleteFoodLogById = useFoodLogStore((state) => state.deleteFoodLogById);

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
        const log = await launchCamera((updated) => {
          // Keep modal in sync with upload progress (avoid stale closure by updating unconditionally)
          modal.setSelectedLog(updated);
        });
        if (log) {
          modal.handleImageCaptured(log);
        }
      } else if (triggerAction === "library") {
        const log = await launchImageLibrary((updated) => {
          modal.setSelectedLog(updated);
        });
        if (log) {
          modal.handleImageCaptured(log);
        }
      } else if (triggerAction === "audio") {
        // Directly open FoodLogModal in audio mode
        modal.handleAudioLog();
      } else if (triggerAction === "favorites") {
        // Open favorites modal in FoodLogScreen
        modal.handleFavoritesLog();
      }
      clearTrigger();
    };

    handle();
  }, [triggerAction, clearTrigger, launchCamera, launchImageLibrary, modal]);

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
          isFavoritesModalVisible={modal.isFavoritesModalVisible}
          onCloseFavoritesModal={modal.handleFavoritesModalClose}
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

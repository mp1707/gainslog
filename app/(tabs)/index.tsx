import React, { useEffect, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native";
import { FoodLogScreen } from "@/components/daily-food-logs/FoodLogScreen";
import { useFoodLogModal } from "@/hooks/useFoodLogModal";
import { useImageCapture } from "@/hooks/useImageCapture";
import { useAppStore } from "@/store";
import { useFoodEstimation } from "@/hooks-new/useFoodEstimation";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { FoodLogModal } from "@/components/daily-food-logs/LogModal";

export default function TodayTab() {
  // Global store for logs & trigger state
  const isLoadingLogs = false; // logs render instantly from persisted store
  const triggerAction = useAppStore((s) => s.triggerAction);
  const clearTrigger = useAppStore((s) => s.clearTrigger);
  const deleteFoodLog = useAppStore((s) => s.deleteFoodLog);

  const keyboardOffset = useKeyboardOffset(true); // true because we have a tab bar

  // State to trigger scroll to top after save
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // Callback for immediate scroll on save-close
  const handleSaveClose = useCallback(() => {
    setShouldScrollToTop(true);
  }, []);

  /* UI hooks */
  const modal = useFoodLogModal(handleSaveClose);
  const estimation = useFoodEstimation();
  const { launchCamera, launchImageLibrary } = useImageCapture();

  // No explicit loading step needed; state persists via zustand persist

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
  const handleSave = useCallback(async (log: any) => {
    // New flow: if it's an image-based create, estimation will be handled externally after upload
    // For text/manual, estimation hook will create the log directly
    // Here, accept the log and let detail modal close; log creation happens via estimation hook
    // Keeping compatibility: no-op here. Actual save occurs inside LogModal using estimation hooks.
  }, []);

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
          onDeleteLog={deleteFoodLog}
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

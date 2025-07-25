import React, { useEffect, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FoodLogScreen, FoodLogModal } from "../../src/features/food-logging";
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
        // Audio functionality not implemented yet - just show modal for manual entry
        modal.handleManualLog();
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
    </GestureHandlerRootView>
  );
}

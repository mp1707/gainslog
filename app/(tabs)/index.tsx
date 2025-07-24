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
  const { captureImage } = useImageCapture();

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
      } else if (triggerAction === "image") {
        const log = await captureImage();
        if (log) {
          modal.handleImageCaptured(log);
        }
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

import React from 'react';
import { FoodLogScreen } from '../FoodLogScreen';
import { FoodLogModal } from '../FoodLogModal';
import { useFoodLogs } from '../../hooks/useFoodLogs';
import { useFoodLogModal } from '../../hooks/useFoodLogModal';
import { useNutritionEstimation } from '../../hooks/useNutritionEstimation';
import { FoodLog } from '../../../../types';

export interface FoodLogContainerProps {
  onAudioRecorded: (log: FoodLog) => void;
}

export interface FoodLogContainerHandlers {
  handleManualLog: () => void;
  handleImageCaptured: (log: FoodLog) => void;
}

/**
 * Container component for food logging functionality
 * Manages the interaction between screen, modal, and business logic
 */
export function FoodLogContainer({ onAudioRecorded }: FoodLogContainerProps): {
  component: React.JSX.Element;
  handlers: FoodLogContainerHandlers;
} {
  const { 
    foodLogs, 
    isLoadingLogs, 
    addFoodLog, 
    updateFoodLogById, 
    deleteFoodLogById,
    updateFoodLogInState,
    addFoodLogToState 
  } = useFoodLogs();

  const {
    isModalVisible,
    modalMode,
    selectedLog,
    handleAddInfo,
    handleManualLog,
    handleImageCaptured,
    handleModalClose,
  } = useFoodLogModal();

  const { processLogWithEstimation } = useNutritionEstimation();

  const handleModalSave = async (log: FoodLog) => {
    if (modalMode === 'create') {
      if (selectedLog) {
        // Image capture case: Add skeleton and process in background
        await processLogWithEstimation(
          log,
          (skeletonLog) => addFoodLogToState(skeletonLog),
          async (finalLog) => {
            updateFoodLogInState(finalLog);
            await addFoodLog(finalLog);
          }
        );
      } else {
        // Manual entry case
        await processLogWithEstimation(
          log,
          (skeletonLog) => addFoodLogToState(skeletonLog),
          async (finalLog) => {
            updateFoodLogInState(finalLog);
            await addFoodLog(finalLog);
          }
        );
      }
    } else {
      // Edit mode - update existing log
      await processLogWithEstimation(
        log,
        (skeletonLog) => updateFoodLogInState(skeletonLog),
        async (finalLog) => {
          await updateFoodLogById(finalLog);
        }
      );
    }
  };

  const component = (
    <>
      <FoodLogScreen
        foodLogs={foodLogs}
        isLoadingLogs={isLoadingLogs}
        onDeleteLog={deleteFoodLogById}
        onAddInfo={handleAddInfo}
      />

      <FoodLogModal
        visible={isModalVisible}
        mode={modalMode}
        selectedLog={selectedLog}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </>
  );

  const handlers = {
    handleManualLog,
    handleImageCaptured,
  };

  return { component, handlers };
}
import React from 'react';
import { AppProvider } from '../../src/app-providers';
import { 
  FoodLogContainer,
  FoodLogActionsProvider,
  ActionTriggerHandler,
  useFoodLogs
} from '../../src/features/food-logging';
import { FoodLog } from '../../src/types';

export default function TodayTab() {
  const { addFoodLog } = useFoodLogs();

  const handleAudioRecorded = async (log: FoodLog) => {
    await addFoodLog(log);
  };

  const { component: foodLogContainer, handlers } = FoodLogContainer({ 
    onAudioRecorded: handleAudioRecorded 
  });

  return (
    <AppProvider>
      <FoodLogActionsProvider
        onManualLog={handlers.handleManualLog}
        onImageCaptured={handlers.handleImageCaptured}
        onAudioRecorded={handleAudioRecorded}
      >
        <ActionTriggerHandler />
        {foodLogContainer}
      </FoodLogActionsProvider>
    </AppProvider>
  );
}
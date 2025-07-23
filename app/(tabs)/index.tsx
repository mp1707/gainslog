import React from 'react';
import { AppProvider } from '../../src/app-providers';
import { 
  FoodLogContainer,
  ActionTriggerHandler,
} from '../../src/features/food-logging';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';
import { FoodLog } from '../../src/types';

export default function TodayTab() {
  const { addFoodLog } = useFoodLogStore();

  const handleAudioRecorded = async (log: FoodLog) => {
    await addFoodLog(log);
  };

  const { component: foodLogContainer, handlers } = FoodLogContainer({ 
    onAudioRecorded: handleAudioRecorded 
  });

  return (
    <AppProvider>
      <ActionTriggerHandler 
        onManualLog={handlers.handleManualLog}
        onImageCaptured={handlers.handleImageCaptured}
        onAudioRecorded={handleAudioRecorded}
      />
      {foodLogContainer}
    </AppProvider>
  );
}
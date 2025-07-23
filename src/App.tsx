import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './app-providers';
import { 
  FoodLogContainer,
  FloatingActionButtons,
  useFoodLogs
} from './features/food-logging';
import { FoodLog } from './types';

export default function App() {
  const { addFoodLog } = useFoodLogs();

  const handleAudioRecorded = async (log: FoodLog) => {
    await addFoodLog(log);
  };

  const { component: foodLogContainer, handlers } = FoodLogContainer({ 
    onAudioRecorded: handleAudioRecorded 
  });

  return (
    <AppProvider>
      <StatusBar style="dark" />
      
      {foodLogContainer}
      
      <FloatingActionButtons
        onManualLog={handlers.handleManualLog}
        onImageCaptured={handlers.handleImageCaptured}
        onAudioRecorded={handleAudioRecorded}
      />
    </AppProvider>
  );
}
import React from "react";
import {
  FoodLogContainer,
  ActionTriggerHandler,
} from "../../src/features/food-logging";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { FoodLog } from "../../src/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TodayTab() {
  const { addFoodLog } = useFoodLogStore();

  const handleAudioRecorded = async (log: FoodLog) => {
    await addFoodLog(log);
  };

  const { component: foodLogContainer, handlers } = FoodLogContainer({
    onAudioRecorded: handleAudioRecorded,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActionTriggerHandler
        onManualLog={handlers.handleManualLog}
        onImageCaptured={handlers.handleImageCaptured}
        onAudioRecorded={handleAudioRecorded}
      />
      {foodLogContainer}
    </GestureHandlerRootView>
  );
}

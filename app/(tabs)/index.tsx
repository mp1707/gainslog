import React from "react";
import {
  FoodLogContainer,
  ActionTriggerHandler,
} from "../../src/features/food-logging";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TodayTab() {
  const { component: foodLogContainer, handlers } = FoodLogContainer();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActionTriggerHandler
        onManualLog={handlers.handleManualLog}
        onImageCaptured={handlers.handleImageCaptured}
      />
      {foodLogContainer}
    </GestureHandlerRootView>
  );
}

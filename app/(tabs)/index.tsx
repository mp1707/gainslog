import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";

export default function TodayTab() {
  const { dynamicBottomPadding } = useTabBarSpacing();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={dynamicBottomPadding}
      ></KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

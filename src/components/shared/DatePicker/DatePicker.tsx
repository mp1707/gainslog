import React, { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Calendar } from "lucide-react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useTheme } from "@/theme";
import { DynamicRoundButton } from "../DynamicRoundButton";

export const DatePicker = ({
  buttonVariant = "secondary",
}: {
  buttonVariant?: "primary" | "secondary" | "tertiary";
}) => {
  const { safePush } = useNavigationGuard();

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/calendar");
  }, [safePush]);

  return (
    <DynamicRoundButton
      variant={buttonVariant}
      systemIcon="calendar"
      legacyIcon={Calendar}
      onPress={handleCalendarPress}
      accessibilityLabel="Open calendar"
      controlSize="small"
    />
  );
};

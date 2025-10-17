import React, { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useTheme } from "@/theme";
import { IOSButton } from "../IOSButton";

export const DatePicker = ({
  buttonVariant = "secondary",
}: {
  buttonVariant?: "primary" | "secondary" | "tertiary";
}) => {
  const { safePush } = useNavigationGuard();
  const { colors } = useTheme();

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/calendar");
  }, [safePush]);

  // Map RoundButton variants to IOSButton variants
  const iosVariant = buttonVariant === "primary" ? "glassProminent" : "glass";
  const iconColor = buttonVariant === "primary" ? colors.black : colors.primaryText;
  const buttonColor = buttonVariant === "primary" ? colors.accent : undefined;

  return (
    <IOSButton
      variant={iosVariant}
      systemIcon="calendar"
      iconColor={iconColor}
      buttonColor={buttonColor}
      onPress={handleCalendarPress}
      accessibilityLabel="Open calendar"
    />
  );
};

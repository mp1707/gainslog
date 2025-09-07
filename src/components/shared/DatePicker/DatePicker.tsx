import React, { ComponentProps, useCallback } from "react";
import { CalendarDays } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { RoundButton } from "../RoundButton";

export const DatePicker = ({
  buttonVariant = "secondary",
}: {
  buttonVariant?: ComponentProps<typeof RoundButton>["variant"];
}) => {
  const { safePush } = useNavigationGuard();

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/calendar");
  }, [safePush]);

  return (
    <RoundButton
      onPress={handleCalendarPress}
      variant={buttonVariant}
      Icon={CalendarDays}
      accessibilityLabel="Open calendar"
    />
  );
};

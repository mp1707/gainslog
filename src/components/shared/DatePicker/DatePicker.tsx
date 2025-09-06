import React, { ComponentProps, useCallback } from "react";
import { CalendarDays } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export const DatePicker = ({
  buttonVariant = "secondary",
}: {
  buttonVariant?: ComponentProps<typeof Button>["variant"];
}) => {
  const { colors } = useTheme();
  const { safePush } = useNavigationGuard();

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/calendar");
  }, [safePush]);

  return (
    <Button
      onPress={handleCalendarPress}
      variant={buttonVariant}
      icon={<CalendarDays size={18} color={colors.secondaryText} />}
      accessibilityLabel="Open calendar"
      grow={false}
    />
  );
};

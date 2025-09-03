import React, { useMemo } from "react";
import { View } from "react-native";
import { CalendarDays, Settings } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { AppText } from "@/components";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./Header.styles";

interface HeaderProps {
  onCalendarPress: () => void;
}

// Smart date formatting function
const formatSelectedDateHeader = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset time components for comparison
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayDateOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );
  const inputDateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (inputDateOnly.getTime() === todayDateOnly.getTime()) {
    return "Today";
  } else if (inputDateOnly.getTime() === yesterdayDateOnly.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

export const Header: React.FC<HeaderProps> = ({ onCalendarPress }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safePush } = useNavigationGuard();
  const { selectedDate } = useAppStore();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  };

  const handleCalendarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCalendarPress();
  };

  return (
    <View style={styles.header}>
      <AppText role="Title2" style={styles.headerTitle}>
        {formatSelectedDateHeader(selectedDate)}
      </AppText>
      <View style={styles.headerButtonContainer}>
        <Button
          onPress={handleSettingsPress}
          variant="secondary"
          size="small"
          icon={<Settings size={16} color={colors.secondaryText} />}
          accessibilityLabel="Open settings"
          grow={false}
          style={{ width: 40, height: 40 }}
        />
        <Button
          onPress={handleCalendarPress}
          variant="secondary"
          icon={<CalendarDays size={18} color={colors.secondaryText} />}
          accessibilityLabel="Open date picker"
          grow={false}
        />
      </View>
    </View>
  );
};

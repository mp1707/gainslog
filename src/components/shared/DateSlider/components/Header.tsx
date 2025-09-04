import React, { useMemo } from "react";
import { View } from "react-native";
import { Settings } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { AppText } from "@/components";
import { Button } from "@/components/shared/Button";
import { DatePickerButton } from "@/components/shared/DatePickerButton";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./Header.styles";
import { formatDate } from "@/utils/formatDate";

interface HeaderProps {
  onDateChange: (date: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onDateChange }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safePush } = useNavigationGuard();
  const { selectedDate } = useAppStore();

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  };

  return (
    <>
      <View style={styles.header}>
        <AppText role="Title2" style={styles.headerTitle}>
          {formatDate(selectedDate)}
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
          <DatePickerButton />
        </View>
      </View>
    </>
  );
};

import React, { useMemo } from "react";
import { View } from "react-native";
import { Settings } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { DatePicker } from "@/components/shared/DatePicker";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./Header.styles";
import { formatDate } from "@/utils/formatDate";
import { RoundButton } from "../../RoundButton";

export const Header: React.FC = () => {
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
          <RoundButton
            onPress={handleSettingsPress}
            Icon={Settings}
            variant="tertiary"
            accessibilityLabel="Open settings"
          />
          <DatePicker buttonVariant="tertiary"/>
        </View>
      </View>
    </>
  );
};

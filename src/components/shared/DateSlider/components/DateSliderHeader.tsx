import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DateSliderHeader.styles";
import { formatDate } from "@/utils/formatDate";
import { hasDailyTargetsSet } from "@/utils";
import { HeaderButton } from "../../HeaderButton/HeaderButton.ios";

export const DateSliderHeader: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safeNavigate } = useNavigationGuard();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);

  const hasGoals = hasDailyTargetsSet(dailyTargets);

  return (
    <View style={styles.header}>
      <AppText role="Title2" style={styles.headerTitle}>
        {formatDate(selectedDate)}
      </AppText>
      <View style={styles.headerButtonContainer}>
        {hasGoals && (
          <HeaderButton
            variant="colored"
            buttonProps={{
              onPress: () => safeNavigate("/new"),
              color: colors.accent,
            }}
            imageProps={{
              systemName: "plus",
              color: colors.black,
            }}
          />
        )}
      </View>
    </View>
  );
};

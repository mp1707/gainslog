import React, { useMemo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DateSliderHeader.styles";
import { formatDate } from "@/utils/dateHelpers";
import { hasDailyTargetsSet } from "@/utils";
import { HeaderButton } from "../../HeaderButton/HeaderButton.ios";
import * as Haptics from "expo-haptics";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export const DateSliderHeader: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { t, i18n } = useTranslation();
  const { safeNavigate } = useNavigationGuard();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const hasLiquidGlass = isLiquidGlassAvailable();

  const hasGoals = hasDailyTargetsSet(dailyTargets);

  const handleNewPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/new");
  };

  return (
    <View style={styles.header}>
      <AppText role="Title1" style={styles.headerTitle}>
        {formatDate(selectedDate, { t, locale: i18n.language })}
      </AppText>
      {!hasLiquidGlass && (
        <View style={styles.headerButtonContainer}>
          {hasGoals && (
            <HeaderButton
              variant="colored"
              size="large"
              buttonProps={{
                onPress: handleNewPress,
                color: colors.accent,
              }}
              imageProps={{
                systemName: "plus",
                color: colors.black,
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

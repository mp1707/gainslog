import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { Card } from "@/components/Card";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import type { ColorScheme, Colors, Theme } from "@/theme";
import type { Favorite } from "@/types/models";
import { usePressAnimation } from "@/hooks/usePressAnimation";

interface FavoritePreviewCardProps {
  favorite: Favorite;
  onPress: () => void;
  width?: number;
}

export const FavoritePreviewCard: React.FC<FavoritePreviewCardProps> = ({
  favorite,
  onPress,
  width = 180,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme, width),
    [theme, colors, colorScheme, width]
  );

  const { handlePressIn, handlePressOut, pressAnimatedStyle } =
    usePressAnimation({
      hapticIntensity: "light",
    });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={`Log favorite meal ${favorite.title}`}
    >
      <Animated.View style={pressAnimatedStyle}>
        <Card
          padding={theme.spacing.md}
          style={[styles.card, { backgroundColor: colors.secondaryBackground }]}
        >
          <AppText
            role="Subhead"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.title}
          >
            {favorite.title}
          </AppText>
          <View style={styles.caloriesRow}>
            <View
              style={[
                styles.calorieDot,
                { backgroundColor: colors.semantic.calories },
              ]}
            />
            <AppText role="Caption" style={styles.calorieText}>
              {Math.round(favorite.calories)} kcal
            </AppText>
          </View>
        </Card>
      </Animated.View>
    </Pressable>
  );
};

const createStyles = (
  theme: Theme,
  colors: Colors,
  colorScheme: ColorScheme,
  width: number
) =>
  StyleSheet.create({
    pressable: {
      borderRadius: theme.getComponentStyles(colorScheme).cards.cornerRadius,
    },
    card: {
      width,
      height: theme.spacing.xxl + theme.spacing.xl + theme.spacing.lg,
      gap: theme.spacing.md,
      justifyContent: "space-between",
    },
    title: {
      color: colors.primaryText,
      flex: 1,
    },
    caloriesRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    calorieDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.spacing.xs,
    },
    calorieText: {
      color: colors.primaryText,
      fontWeight: "600",
    },
  });

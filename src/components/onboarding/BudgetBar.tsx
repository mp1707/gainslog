import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";

interface BudgetBarProps {
  totalCalories: number;
  proteinCalories: number;
  fatCalories: number;
  carbCalories: number;
}

export const BudgetBar = ({
  totalCalories,
  proteinCalories,
  fatCalories,
  carbCalories,
}: BudgetBarProps) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const proteinPct = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
  const fatPct = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;
  const carbPct = totalCalories > 0 ? (carbCalories / totalCalories) * 100 : 0;
  const remainingPct = 100 - proteinPct - fatPct - carbPct;

  const proteinAnimatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${proteinPct}%`, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const fatAnimatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${fatPct}%`, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const carbAnimatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${carbPct}%`, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const remainingAnimatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.max(0, remainingPct)}%`, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const remainingCalories = totalCalories - proteinCalories - fatCalories - carbCalories;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText role="Caption" color="secondary">
          Daily Calorie Budget
        </AppText>
        <AppText role="Headline">{totalCalories} kcal</AppText>
      </View>

      {/* Budget Bar */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          {proteinPct > 0 && (
            <Animated.View
              style={[
                styles.barSegment,
                { backgroundColor: colors.semantic.protein },
                proteinAnimatedStyle,
              ]}
            />
          )}
          {fatPct > 0 && (
            <Animated.View
              style={[
                styles.barSegment,
                { backgroundColor: colors.semantic.fat },
                fatAnimatedStyle,
              ]}
            />
          )}
          {carbPct > 0 && (
            <Animated.View
              style={[
                styles.barSegment,
                { backgroundColor: colors.semantic.carbs },
                carbAnimatedStyle,
              ]}
            />
          )}
          {remainingPct > 0 && (
            <Animated.View
              style={[
                styles.barSegment,
                { backgroundColor: colors.subtleBackground },
                remainingAnimatedStyle,
              ]}
            />
          )}
        </View>
      </View>

      {/* Remaining Calories - only show if >= 4 kcal (enough for 1g carbs) */}
      {remainingCalories >= 4 && (
        <View style={styles.remainingContainer}>
          <AppText role="Body" color="accent">
            {Math.round(remainingCalories)} kcal remaining for Carbs
          </AppText>
        </View>
      )}
    </View>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    barContainer: {
      //
    },
    barTrack: {
      height: 12,
      backgroundColor: colors.subtleBackground,
      borderRadius: 6,
      overflow: "hidden",
      flexDirection: "row",
    },
    barSegment: {
      height: "100%",
    },
    remainingContainer: {
      alignItems: "center",
    },
  });
};

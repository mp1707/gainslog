import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { BicepsFlexed, Wheat, Droplet } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

interface CalorieBreakdownProps {
  totalCalories: number;
  proteinGrams?: number;
  fatGrams?: number;
  carbGrams?: number;
  highlightMacro?: "protein" | "fat" | "carbs";
}

interface MacroRowProps {
  icon: LucideIcon;
  color: string;
  label: string;
  grams?: number;
  calories: number;
  percentage: number;
  totalCalories: number;
  isHighlighted: boolean;
  isRemainder: boolean;
}

const MacroRow = ({
  icon,
  color,
  label,
  grams,
  calories,
  percentage,
  isHighlighted,
  isRemainder,
}: MacroRowProps) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createMacroRowStyles(colors, themeObj, isHighlighted);
  const Icon = icon;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          <Icon size={16} color={color} fill={color} strokeWidth={0} />
          <AppText role="Caption" color="secondary">{label}</AppText>
        </View>
        <View style={styles.labelRight}>
          <AppText role="Body">{isRemainder ? "—" : `${grams}g`}</AppText>
        </View>
      </View>

      <View style={styles.infoRow}>
        <AppText role="Caption" color="secondary">
          {isRemainder
            ? "Not yet allocated"
            : `${calories} kcal (${percentage}%)`}
        </AppText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export const CalorieBreakdown = ({
  totalCalories,
  proteinGrams = 0,
  fatGrams = 0,
  carbGrams = 0,
  highlightMacro,
}: CalorieBreakdownProps) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  // Calculations
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const carbCals = carbGrams * 4;
  const usedCals = proteinCals + fatCals + carbCals;
  const remaining = totalCalories - usedCals;

  // Percentages
  const proteinPct = Math.round((proteinCals / totalCalories) * 100);
  const fatPct = Math.round((fatCals / totalCalories) * 100);
  const carbPct = Math.round((carbCals / totalCalories) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText role="Caption" color="secondary">Total Daily Calories</AppText>
        <AppText role="Headline">{totalCalories} kcal</AppText>
      </View>

      {/* Protein Row */}
      <MacroRow
        icon={BicepsFlexed}
        color={colors.semantic.protein}
        label="Protein"
        grams={proteinGrams}
        calories={proteinCals}
        percentage={proteinPct}
        totalCalories={totalCalories}
        isHighlighted={highlightMacro === "protein"}
        isRemainder={proteinGrams === 0}
      />

      {/* Fat Row */}
      <MacroRow
        icon={Droplet}
        color={colors.semantic.fat}
        label="Fat"
        grams={fatGrams}
        calories={fatCals}
        percentage={fatPct}
        totalCalories={totalCalories}
        isHighlighted={highlightMacro === "fat"}
        isRemainder={fatGrams === 0}
      />

      {/* Carbs Row */}
      <MacroRow
        icon={Wheat}
        color={colors.semantic.carbs}
        label="Carbs"
        grams={carbGrams}
        calories={carbCals}
        percentage={carbPct}
        totalCalories={totalCalories}
        isHighlighted={highlightMacro === "carbs"}
        isRemainder={carbGrams === 0}
      />

      {/* Remaining Calories */}
      {remaining > 0 && (
        <View style={styles.remainingSection}>
          <AppText role="Caption" color="accent">
            {remaining} kcal remaining
          </AppText>
        </View>
      )}
    </View>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.subtleBackground,
      marginVertical: spacing.xs,
    },
    remainingSection: {
      alignItems: "center",
      marginTop: spacing.xs,
    },
  });
};

const createMacroRowStyles = (
  colors: Colors,
  theme: Theme,
  isHighlighted: boolean
) => {
  const { spacing } = theme;

  return StyleSheet.create({
    container: {
      gap: spacing.xs / 2,
      paddingVertical: spacing.xs / 2,
      backgroundColor: "transparent",
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    labelLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    labelRight: {
      //
    },
    infoRow: {
      //
    },
    progressBarContainer: {
      marginTop: spacing.xs / 2,
    },
    progressBarTrack: {
      height: 3,
      backgroundColor: colors.subtleBackground,
      borderRadius: 1.5,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 1.5,
    },
  });
};

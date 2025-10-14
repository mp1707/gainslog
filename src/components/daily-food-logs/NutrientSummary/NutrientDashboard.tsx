import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { Theme, useTheme } from "@/theme";
import { SetGoalsCTA } from "./SetGoalsCTA";
import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { useNutrientCalculations } from "./hooks/useNutrientCalculations";
import { useNutrientAnimations } from "./hooks/useNutrientAnimations";
import { useNutrientNavigation } from "./hooks/useNutrientNavigation";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import {
  RING_CONFIG,
  NUTRIENT_LABELS,
  ANIMATION_DELAYS,
  type NutrientKey,
} from "./utils/constants";
import { getChevronIcon, getNutrientIcon } from "./utils/nutrientFormatters";

const ICON_SIZE = 22;

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface NutrientDashboardProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

const RING_KEYS = ["calories", "protein"] as const;

/**
 * Dashboard displaying nutrient intake progress with ring and label visualizations.
 */
export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const hasNoGoals =
    (targets.calories || 0) === 0 &&
    (targets.protein || 0) === 0 &&
    (targets.carbs || 0) === 0 &&
    (targets.fat || 0) === 0;

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColors = useMemo(
    () =>
      ({
        calories: colors.semantic.calories,
        protein: colors.semantic.protein,
        carbs: colors.semantic.carbs,
        fat: colors.semantic.fat,
      } as Record<NutrientKey, string>),
    [colors]
  );

  const surfaceColors = useMemo(
    () =>
      ({
        calories: colors.semanticSurfaces.calories,
        protein: colors.semanticSurfaces.protein,
        carbs: colors.semanticSurfaces.carbs,
        fat: colors.semanticSurfaces.fat,
      } as Record<NutrientKey, string>),
    [colors]
  );

  const calculations = useNutrientCalculations({
    totals,
    targets,
    percentages,
  });

  const animations = useNutrientAnimations({
    totals,
    percentages,
    isProteinComplete: calculations.isProteinComplete,
  });

  const { handleOpenExplainer } = useNutrientNavigation({
    totals,
    targets,
    percentages,
  });

  const caloriesPressAnimation = usePressAnimation();
  const proteinPressAnimation = usePressAnimation();

  const ringPressAnimations = {
    calories: caloriesPressAnimation,
    protein: proteinPressAnimation,
  } as const;

  const animatedTotals: Record<NutrientKey, number> = {
    calories: animations.animatedCaloriesTotal,
    protein: animations.animatedProteinTotal,
    fat: animations.animatedFatTotal,
    carbs: animations.animatedCarbsTotal,
  };

  const labelTargets: Partial<Record<NutrientKey, number>> = {
    calories: Math.round(targets.calories || 0),
    protein: Math.round(targets.protein || 0),
    fat: Math.round(targets.fat || 0),
  };

  return (
    <View style={styles.container}>
      <View style={styles.ringRow}>
        {RING_KEYS.map((ringKey, index) => {
          const ringConfig = RING_CONFIG.find((item) => item.key === ringKey)!;
          const ringPercentage = percentages[ringKey] || 0;
          const chevronIcon = getChevronIcon(ringPercentage);
          const { handlePressIn, handlePressOut, pressAnimatedStyle } =
            ringPressAnimations[ringKey];
          const ringTarget = labelTargets[ringKey];
          const ringDetailValue =
            typeof ringTarget === "number" ? `of ${ringTarget}` : undefined;

          return (
            <View key={ringKey} style={styles.ringCell}>
              <AppText
                role="Subhead"
                color="secondary"
                style={styles.ringLabel}
              >
                {ringConfig.label}
              </AppText>
              <Pressable
                onPress={() => handleOpenExplainer(ringKey)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.ringPressable}
              >
                <Animated.View style={pressAnimatedStyle}>
                  <DashboardRing
                    label={ringConfig.label}
                    displayUnit={ringConfig.unit}
                    detailUnit=""
                    showDetail={false}
                    percentage={ringPercentage}
                    color={semanticColors[ringKey]}
                    trackColor={surfaceColors[ringKey]}
                    textColor={colors.primaryText}
                    displayValue={animatedTotals[ringKey]}
                    detailValue={ringDetailValue}
                    animationDelay={index * ANIMATION_DELAYS.RING_STAGGER}
                    strokeWidth={18}
                    Icon={chevronIcon}
                    skipAnimation={animations.dateChanged}
                  />
                </Animated.View>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Macro Grid: Fat and Carbs only */}
      <View style={styles.macroGrid}>
        <View style={styles.gridRow}>
          <MacroGridCell
            nutrientKey="fat"
            total={animatedTotals.fat}
            target={labelTargets.fat}
            unit="g"
            percentage={percentages.fat}
            semanticColor={semanticColors.fat}
            showProgressBar
            onPress={() => handleOpenExplainer("fat")}
          />
          <MacroGridCell
            nutrientKey="carbs"
            total={animatedTotals.carbs}
            unit="g"
            semanticColor={semanticColors.carbs}
            onPress={() => handleOpenExplainer("carbs")}
          />
        </View>
      </View>
    </View>
  );
};

interface MacroGridCellProps {
  nutrientKey: NutrientKey;
  total: number | string;
  target?: number | string;
  unit: string;
  percentage?: number;
  semanticColor: string;
  showProgressBar?: boolean;
  iconScale?: SharedValue<number>;
  isComplete?: boolean;
  onPress?: () => void;
}

const MacroGridCell: React.FC<MacroGridCellProps> = ({
  nutrientKey,
  total,
  target,
  unit,
  percentage,
  semanticColor,
  showProgressBar = false,
  iconScale,
  isComplete = false,
  onPress,
}) => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createGridCellStyles(theme), [theme]);
  const { handlePressIn, handlePressOut, pressAnimatedStyle } =
    usePressAnimation({
      disabled: !onPress,
    });

  const config = NUTRIENT_LABELS[nutrientKey];

  // Only use getNutrientIcon for calories and protein (rings)
  const IconComponent =
    nutrientKey === "calories" || nutrientKey === "protein"
      ? getNutrientIcon(config.Icon, isComplete, nutrientKey)
      : config.Icon;

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale ? iconScale.value : 1 }],
  }));

  // Convert percentage to decimal for width (e.g., 75% -> 0.75)
  const progressBarFillWidth =
    showProgressBar && percentage ? Math.min(percentage, 100) / 100 : 0;

  const cellContent = (
    <View style={styles.cellContainer}>
      {/* Label Text */}
      <AppText role="Subhead" color="secondary" style={styles.label}>
        {config.label}
      </AppText>

      {/* Icon + Value Row */}
      <View style={styles.valueRow}>
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <IconComponent
            size={ICON_SIZE}
            color={semanticColor}
            fill={semanticColor}
            strokeWidth={0}
          />
        </Animated.View>
        <View style={styles.valueContainer}>
          <AppText role="Headline" color="primary">
            {total}
          </AppText>
          {target != null && (
            <>
              <AppText role="Body" color="secondary">
                {" "}
                /{" "}
              </AppText>
              <AppText role="Body" color="secondary">
                {target}
              </AppText>
            </>
          )}
          <AppText role="Body" color="secondary" style={styles.unitText}>
            {" "}
            {unit}
          </AppText>
        </View>
      </View>

      {/* Progress Bar (Fat only) */}
      {showProgressBar && (
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: colors.disabledBackground },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: semanticColor,
                width: `${progressBarFillWidth * 100}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );

  if (!onPress) {
    return cellContent;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressableCell}
    >
      <Animated.View style={pressAnimatedStyle}>{cellContent}</Animated.View>
    </Pressable>
  );
};

const createGridCellStyles = (theme: Theme) =>
  StyleSheet.create({
    pressableCell: {
      flex: 1,
    },
    cellContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    iconContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    unitText: {
      marginLeft: theme.spacing.xs / 2,
    },
    progressBarTrack: {
      width: "55%",
      height: 5,
      borderRadius: 2.5,
      overflow: "hidden",
      marginTop: theme.spacing.xs,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2.5,
    },
    label: {
      textAlign: "center",
    },
  });

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    ringRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.lg,
    },
    ringCell: {
      flex: 1,
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    ringPressable: {
      width: "100%",
      alignItems: "center",
    },
    ringLabel: {
      textAlign: "center",
    },
    macroGrid: {
      gap: theme.spacing.lg,
    },
    gridRow: {
      flexDirection: "row",
      gap: theme.spacing.lg,
    },
  });

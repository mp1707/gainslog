import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import {
  Droplet,
  Flame,
  BicepsFlexed,
  Zap,
  ChevronDown,
  ChevronsDown,
} from "lucide-react-native";

import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Theme, useTheme } from "@/theme";
import { useNumberReveal, SPRING_CONFIG } from "@/hooks/useAnimationConfig";

import { SetGoalsCTA } from "./SetGoalsCTA";

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

const SECONDARY_STATS = [
  { key: "fat", label: "Fat (g) - Baseline for health", Icon: Droplet, hasTarget: true },
  { key: "carbs", label: "Carbs (g) - No target just fuel", Icon: Zap, hasTarget: false },
] as const;

const RING_CONFIG = [
  {
    key: "calories",
    label: "Calories (kcal)",
    Icon: Flame,
    hasTarget: true,
  },
  {
    key: "protein",
    label: "Protein (g)",
    Icon: BicepsFlexed,
    hasTarget: true,
  },
] as const;

export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Animated values for delta amounts (remaining or over)
  const caloriesDelta = (targets.calories || 0) - (totals.calories || 0);
  const proteinDelta = (targets.protein || 0) - (totals.protein || 0);
  const animatedCaloriesDelta = useNumberReveal(Math.abs(caloriesDelta));
  const animatedProteinDelta = useNumberReveal(Math.abs(proteinDelta));

  // Animated values for secondary stats totals
  const animatedFatTotal = useNumberReveal(Math.round(totals.fat || 0));
  const animatedCarbsTotal = useNumberReveal(Math.round(totals.carbs || 0));

  // Animated values for ring label totals
  const animatedCaloriesTotal = useNumberReveal(
    Math.round(totals.calories || 0)
  );
  const animatedProteinTotal = useNumberReveal(Math.round(totals.protein || 0));

  // Animated progress bars for secondary stats
  const fatProgress = useSharedValue(0);
  const carbsProgress = useSharedValue(0);

  const hasNoGoals = useMemo(() => {
    return (
      (targets.calories || 0) === 0 &&
      (targets.protein || 0) === 0 &&
      (targets.carbs || 0) === 0 &&
      (targets.fat || 0) === 0
    );
  }, [targets]);

  const semanticColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  } as const;
  const surfaceColors = {
    calories: colors.semanticSurfaces.calories,
    protein: colors.semanticSurfaces.protein,
    carbs: colors.semanticSurfaces.carbs,
    fat: colors.semanticSurfaces.fat,
  } as const;

  // Trigger count-up animations when delta values change
  useEffect(() => {
    animatedCaloriesDelta.animateTo(Math.abs(caloriesDelta));
    animatedProteinDelta.animateTo(Math.abs(proteinDelta));
  }, [caloriesDelta, proteinDelta]);

  // Trigger count-up animations when secondary stats totals change
  useEffect(() => {
    animatedFatTotal.animateTo(Math.round(totals.fat || 0));
    animatedCarbsTotal.animateTo(Math.round(totals.carbs || 0));
  }, [totals.fat, totals.carbs]);

  // Trigger count-up animations when ring label totals change
  useEffect(() => {
    animatedCaloriesTotal.animateTo(Math.round(totals.calories || 0));
    animatedProteinTotal.animateTo(Math.round(totals.protein || 0));
  }, [totals.calories, totals.protein]);

  // Trigger progress bar animations with spring matching rings
  useEffect(() => {
    const fatTarget = targets.fat || 0;
    const fatCurrent = totals.fat || 0;
    const fatPercentage =
      fatTarget > 0 ? Math.min((fatCurrent / fatTarget) * 100, 100) : 0;

    const carbsTarget = targets.carbs || 0;
    const carbsCurrent = totals.carbs || 0;
    const carbsPercentage =
      carbsTarget > 0 ? Math.min((carbsCurrent / carbsTarget) * 100, 100) : 0;

    // Animate with same spring config and delay as rings
    fatProgress.value = withDelay(
      800, // After the two rings (400 * 2)
      withSpring(fatPercentage, SPRING_CONFIG)
    );

    carbsProgress.value = withDelay(
      800, // Same delay as fat (or stagger if desired)
      withSpring(carbsPercentage, SPRING_CONFIG)
    );
  }, [
    totals.fat,
    totals.carbs,
    targets.fat,
    targets.carbs,
    fatProgress,
    carbsProgress,
  ]);

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.ringsRow}>
        {RING_CONFIG.map((config, index) => {
          const percentage = percentages[config.key] || 0;
          const total =
            config.key === "calories"
              ? animatedCaloriesTotal.display
              : animatedProteinTotal.display;
          const target = Math.round(targets[config.key] || 0);
          const actualTotal = Math.round(totals[config.key] || 0);
          const isOver = actualTotal >= target;
          const deltaValue =
            config.key === "calories"
              ? animatedCaloriesDelta.display
              : animatedProteinDelta.display;
          const label = isOver ? "over" : "remaining";
          const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;
          const LabelIcon = config.Icon;

          return (
            <View key={config.key} style={styles.ringContainer}>
              <DashboardRing
                percentage={percentage}
                color={semanticColors[config.key]}
                trackColor={surfaceColors[config.key]}
                textColor={colors.primaryText}
                label={config.label}
                displayValue={deltaValue.toString()}
                displayUnit=""
                detailValue={label}
                detailUnit=""
                showDetail={false}
                animationDelay={index * 400}
                strokeWidth={20}
                Icon={ChevronIcon}
              />
              <View style={styles.ringLabelContainer}>
                <View style={styles.ringLabelHeader}>
                  <LabelIcon
                    size={20}
                    color={semanticColors[config.key]}
                    fill={semanticColors[config.key]}
                    strokeWidth={0}
                  />
                  <AppText role="Caption" color="secondary">
                    {config.label}
                  </AppText>
                </View>
                <View style={styles.ringLabelProgress}>
                  <AppText role="Body" color="primary">
                    {total}
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {" / "}
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {target}
                  </AppText>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.statsContainer}>
        {SECONDARY_STATS.map((config) => {
          const Icon = config.Icon;
          const current =
            config.key === "fat"
              ? animatedFatTotal.display
              : animatedCarbsTotal.display;
          const target = Math.round(targets[config.key] || 0);
          const iconColor = semanticColors[config.key];
          const progressValue =
            config.key === "fat" ? fatProgress : carbsProgress;

          // Animated style for progress bar fill
          const progressStyle = useAnimatedStyle(() => ({
            width: `${progressValue.value}%`,
            backgroundColor: semanticColors[config.key],
          }));

          return (
            <View key={config.key} style={styles.statItemWrapper}>
              <View style={styles.statRow}>
                <Icon
                  size={20}
                  color={iconColor}
                  fill={iconColor}
                  strokeWidth={0}
                />
                <View style={styles.statContent}>
                  <View style={styles.statHeader}>
                    <AppText role="Caption" color="secondary">
                      {config.label}
                    </AppText>
                    <View style={styles.statValue}>
                      {config.hasTarget ? (
                        <>
                          <AppText role="Body" color="primary">
                            {current}
                          </AppText>
                          <AppText role="Caption" color="secondary">
                            {" / "}
                          </AppText>
                          <AppText role="Caption" color="secondary">
                            {target}
                          </AppText>
                        </>
                      ) : (
                        <>
                          <AppText role="Body" color="secondary">
                            {current}
                          </AppText>
                        </>
                      )}
                    </View>
                  </View>
                  {config.hasTarget && target > 0 && (
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: surfaceColors[config.key] },
                        ]}
                      >
                        <Animated.View
                          style={[styles.progressFill, progressStyle]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    ringsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    ringContainer: {
      flex: 1,
      alignItems: "center",
    },
    ringLabelContainer: {
      alignItems: "center",
      gap: theme.spacing.xs / 2,
      marginTop: theme.spacing.sm,
    },
    ringLabelHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    ringLabelProgress: {
      flexDirection: "row",
      alignItems: "center",
    },
    statsContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    statItemWrapper: {
      paddingVertical: theme.spacing.xs,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },
    statContent: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    statHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statValue: {
      flexDirection: "row",
      alignItems: "center",
    },
    progressBarContainer: {
      width: "100%",
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
  });

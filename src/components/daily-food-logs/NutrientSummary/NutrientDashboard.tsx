import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  Droplet,
  Flame,
  BicepsFlexed,
  Zap,
  ChevronDown,
  ChevronsDown,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Theme, useTheme, theme } from "@/theme";
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
  {
    key: "fat",
    label: "Fat (g)",
    Icon: Droplet,
    hasTarget: true,
  },
  {
    key: "carbs",
    label: "Carbs (g)",
    Icon: Zap,
    hasTarget: false,
  },
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

// Snappier spring config for icon check animations
const ICON_SPRING_CONFIG = {
  mass: 0.8,
  damping: 15,
  stiffness: 400,
} as const;

export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  // Check if there are no goals BEFORE any hooks
  const hasNoGoals =
    (targets.calories || 0) === 0 &&
    (targets.protein || 0) === 0 &&
    (targets.carbs || 0) === 0 &&
    (targets.fat || 0) === 0;

  // Early return before hooks if no goals are set
  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  // Animated scales for icon transitions
  const proteinIconScale = useSharedValue(1);
  const fatIconScale = useSharedValue(1);

  // Animated scales for press feedback on rings
  const caloriesRingScale = useSharedValue(1);
  const proteinRingScale = useSharedValue(1);

  // Animated scales for press feedback on stats
  const fatStatScale = useSharedValue(1);
  const carbsStatScale = useSharedValue(1);

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
  // Staggered to match progress bar animations (800ms delay for fat)
  useEffect(() => {
    animatedFatTotal.animateTo(Math.round(totals.fat || 0), 800);
    animatedCarbsTotal.animateTo(Math.round(totals.carbs || 0));
  }, [totals.fat, totals.carbs]);

  // Trigger count-up animations when ring label totals change
  // Staggered to match ring animations (0ms for calories, 400ms for protein)
  useEffect(() => {
    animatedCaloriesTotal.animateTo(Math.round(totals.calories || 0), 0);
    animatedProteinTotal.animateTo(Math.round(totals.protein || 0), 400);
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

  // Trigger icon scale animations when reaching 100%
  useEffect(() => {
    const proteinPercentage = percentages.protein || 0;

    if (proteinPercentage >= 100) {
      proteinIconScale.value = 0.5;
      proteinIconScale.value = withSpring(1, ICON_SPRING_CONFIG);
    } else {
      proteinIconScale.value = 1;
    }
  }, [percentages.protein, proteinIconScale]);

  useEffect(() => {
    const fatMinGrams = targets.fat || 0; // 20% minimum
    const fatMaxGrams = targets.calories
      ? Math.round((targets.calories) * 0.35 / 9) // 35% maximum
      : 0;
    const fatCurrent = totals.fat || 0;

    // Trigger animation if in optimal range (min-max grams) or above max
    const isInRange = fatCurrent >= fatMinGrams && fatCurrent <= fatMaxGrams;
    const isAboveMax = fatCurrent > fatMaxGrams && fatMaxGrams > 0;
    const shouldAnimate = isInRange || isAboveMax;

    if (shouldAnimate) {
      fatIconScale.value = 0.5;
      fatIconScale.value = withSpring(1, ICON_SPRING_CONFIG);
    } else {
      fatIconScale.value = 1;
    }
  }, [totals.fat, targets.fat, targets.calories, fatIconScale]);

  // Handler for opening explainer pages
  const handleOpenModal = (nutrient: "calories" | "protein" | "fat" | "carbs") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const total = Math.round(totals[nutrient] || 0);
    const target = Math.round(targets[nutrient] || 0);
    const percentage = Math.round(percentages[nutrient] || 0);

    // For fat explainer, also pass calories target to calculate range
    if (nutrient === "fat") {
      const caloriesTarget = Math.round(targets.calories || 0);
      router.push(
        `/explainer-${nutrient}?total=${total}&target=${target}&percentage=${percentage}&caloriesTarget=${caloriesTarget}` as any
      );
    } else {
      router.push(
        `/explainer-${nutrient}?total=${total}&target=${target}&percentage=${percentage}` as any
      );
    }
  };

  // Press handlers for rings
  const handleCaloriesRingPressIn = () => {
    caloriesRingScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
  };

  const handleCaloriesRingPressOut = () => {
    caloriesRingScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  };

  const handleProteinRingPressIn = () => {
    proteinRingScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
  };

  const handleProteinRingPressOut = () => {
    proteinRingScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  };

  // Press handlers for stats
  const handleFatStatPressIn = () => {
    fatStatScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
  };

  const handleFatStatPressOut = () => {
    fatStatScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  };

  const handleCarbsStatPressIn = () => {
    carbsStatScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
  };

  const handleCarbsStatPressOut = () => {
    carbsStatScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  };

  // Animated styles for press feedback
  const caloriesRingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: caloriesRingScale.value }],
  }));

  const proteinRingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: proteinRingScale.value }],
  }));

  const fatStatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fatStatScale.value }],
  }));

  const carbsStatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: carbsStatScale.value }],
  }));

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
          const isComplete = percentage >= 100 && config.key === "protein";
          const LabelIcon = isComplete ? CircleCheckBig : config.Icon;

          // Animated style for icon scale (only for protein)
          const iconAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: isComplete ? proteinIconScale.value : 1 }],
          }));

          const ringAnimatedStyle =
            config.key === "calories"
              ? caloriesRingAnimatedStyle
              : proteinRingAnimatedStyle;

          const handlePressIn =
            config.key === "calories"
              ? handleCaloriesRingPressIn
              : handleProteinRingPressIn;

          const handlePressOut =
            config.key === "calories"
              ? handleCaloriesRingPressOut
              : handleProteinRingPressOut;

          return (
            <Pressable
              key={config.key}
              onPress={() => handleOpenModal(config.key as "calories" | "protein")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.ringContainer}
            >
              <Animated.View style={ringAnimatedStyle}>
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
                    <Animated.View style={iconAnimatedStyle}>
                      <LabelIcon
                        size={20}
                        color={semanticColors[config.key]}
                        fill={
                          isComplete
                            ? surfaceColors[config.key]
                            : semanticColors[config.key]
                        }
                        strokeWidth={isComplete ? 2 : 0}
                      />
                    </Animated.View>
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
              </Animated.View>
            </Pressable>
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

          // Calculate percentage for secondary stats
          const actualCurrent =
            config.key === "fat" ? totals.fat || 0 : totals.carbs || 0;
          const actualTarget =
            config.key === "fat" ? targets.fat || 0 : targets.carbs || 0;

          // For fat: calculate gram ranges based on target calories (20-35%)
          // targets.fat represents the 20% minimum baseline
          const fatMinGrams = actualTarget; // 20% minimum
          const fatMaxGrams = config.key === "fat"
            ? Math.round((targets.calories || 0) * 0.35 / 9) // 35% maximum
            : 0;
          const currentFatGrams = actualCurrent;

          // Determine fat icon state based on GRAM ranges (not percentage of consumed calories)
          const isFatInRange = currentFatGrams >= fatMinGrams && currentFatGrams <= fatMaxGrams && config.key === "fat";
          const isFatAboveMax = currentFatGrams > fatMaxGrams && config.key === "fat" && fatMaxGrams > 0;

          const isStatComplete = isFatInRange;
          const isStatWarning = isFatAboveMax;

          // Select icon based on state (fat only)
          let StatIcon = Icon;
          if (config.key === "fat") {
            if (isStatWarning) {
              StatIcon = TriangleAlert;
            } else if (isStatComplete) {
              StatIcon = CircleCheckBig;
            }
          }

          // Format fat label with range
          const fatRangeLabel = config.key === "fat" && fatMinGrams > 0
            ? `${fatMinGrams}-${fatMaxGrams}g`
            : null;

          // Animated style for secondary stat icon scale (only for fat)
          const statIconAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: (isStatComplete || isStatWarning) ? fatIconScale.value : 1 }],
          }));

          const statAnimatedStyle =
            config.key === "fat" ? fatStatAnimatedStyle : carbsStatAnimatedStyle;

          const handleStatPressIn =
            config.key === "fat" ? handleFatStatPressIn : handleCarbsStatPressIn;

          const handleStatPressOut =
            config.key === "fat" ? handleFatStatPressOut : handleCarbsStatPressOut;

          return (
            <Pressable
              key={config.key}
              onPress={() => handleOpenModal(config.key as "fat" | "carbs")}
              onPressIn={handleStatPressIn}
              onPressOut={handleStatPressOut}
              style={styles.statItemWrapper}
            >
              <Animated.View style={[styles.statRow, statAnimatedStyle]}>
                <Animated.View style={statIconAnimatedStyle}>
                  <StatIcon
                    size={20}
                    color={
                      isStatWarning
                        ? colors.warning
                        : iconColor
                    }
                    fill={
                      isStatWarning
                        ? colors.warningBackground
                        : isStatComplete
                        ? surfaceColors[config.key]
                        : iconColor
                    }
                    strokeWidth={isStatComplete || isStatWarning ? 2 : 0}
                  />
                </Animated.View>
                <View style={styles.statContent}>
                  <View style={styles.statHeader}>
                    <View style={styles.statLabelContainer}>
                      <AppText role="Caption" color="secondary">
                        {config.label}
                      </AppText>
                      {fatRangeLabel && (
                        <AppText role="Caption" color="secondary">
                          Baseline {fatRangeLabel}
                        </AppText>
                      )}
                    </View>
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
              </Animated.View>
            </Pressable>
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
    statLabelContainer: {
      gap: theme.spacing.xs / 4,
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

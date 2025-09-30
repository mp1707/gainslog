import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet } from "react-native";
import {
  Droplet,
  Flame,
  BicepsFlexed,
  Wheat,
  ChevronDown,
  ChevronsDown,
} from "lucide-react-native";

import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Colors, Theme, useTheme } from "@/theme";

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

const STAT_CONFIG = [
  { key: "calories", label: "Calories", unit: "kcal", Icon: Flame },
  { key: "protein", label: "Protein", unit: "g", Icon: BicepsFlexed },
  { key: "fat", label: "Fat", unit: "g", Icon: Droplet },
  { key: "carbs", label: "Carbs", unit: "g", Icon: Wheat },
] as const;

const STAT_ROWS = [
  [STAT_CONFIG[0], STAT_CONFIG[1]], // Calories, Protein
  [STAT_CONFIG[2], STAT_CONFIG[3]], // Fat, Carbs
] as const;

const RING_CONFIG = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
] as const;

// Utility to run a quick slot-machine then count-up animation via state
const useNumberReveal = (initial: number) => {
  const prevRef = useRef(initial);
  const [display, setDisplay] = useState(initial);
  const flickerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const animateTo = useCallback((target: number) => {
    const startPrev = prevRef.current;
    prevRef.current = target;

    // Clear any existing animations
    if (flickerRef.current) {
      clearInterval(flickerRef.current);
      flickerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Phase 1: slot-machine (random flicker ~250ms)
    const flickerDuration = 250;
    const flickerStep = 35;
    let elapsed = 0;
    flickerRef.current = setInterval(() => {
      elapsed += flickerStep;
      setDisplay(Math.max(0, Math.round(target * Math.random())));
      if (elapsed >= flickerDuration) {
        if (flickerRef.current) {
          clearInterval(flickerRef.current);
          flickerRef.current = null;
        }
        // Phase 2: count-up/down to target (~1200ms) with spring-like easing
        const total = 1200;
        const start = Date.now();
        const from = isNaN(startPrev) ? 0 : startPrev;
        const tick = () => {
          const t = Math.min(1, (Date.now() - start) / total);

          // Spring-like easing that mimics the ring animation
          // Combines exponential decay with damping for gradual deceleration
          const springEased =
            1 - Math.exp(-3.5 * t) * Math.cos(2.5 * t) * (1 - t * 0.8);
          const finalEased = Math.min(1, Math.max(0, springEased));

          const val = Math.round(from + (target - from) * finalEased);
          setDisplay(val);
          if (t < 1) {
            animationRef.current = requestAnimationFrame(tick);
          } else {
            animationRef.current = null;
          }
        };
        animationRef.current = requestAnimationFrame(tick);
      }
    }, flickerStep);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flickerRef.current) {
        clearInterval(flickerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { display, animateTo } as const;
};

export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Animated values for delta amounts (remaining or over)
  const caloriesDelta = (targets.calories || 0) - (totals.calories || 0);
  const proteinDelta = (targets.protein || 0) - (totals.protein || 0);
  const animatedCaloriesDelta = useNumberReveal(Math.abs(caloriesDelta));
  const animatedProteinDelta = useNumberReveal(Math.abs(proteinDelta));

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

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.ringsRow}>
        {RING_CONFIG.map((config, index) => {
          const percentage = percentages[config.key] || 0;
          const total = totals[config.key] || 0;
          const target = targets[config.key] || 0;
          const isOver = total >= target;
          const deltaValue =
            config.key === "calories"
              ? animatedCaloriesDelta.display
              : animatedProteinDelta.display;
          const label = isOver ? "over" : "remaining";
          const Icon = percentage >= 100 ? ChevronsDown : ChevronDown;

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
                strokeWidth={26}
                Icon={Icon}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.statsContainer}>
        {STAT_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.statsRow}>
            {row.map((config) => {
              const Icon = config.Icon;
              const current = Math.round(totals[config.key] || 0);
              const target = Math.round(targets[config.key] || 0);
              return (
                <View key={config.key} style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconBackground,
                      { backgroundColor: surfaceColors[config.key] },
                    ]}
                  >
                    <Icon
                      size={20}
                      color={semanticColors[config.key]}
                      fill={semanticColors[config.key]}
                      strokeWidth={0}
                    />
                  </View>
                  <View style={styles.statTextContainer}>
                    <AppText style={styles.statLabel}>
                      {config.label} ({config.unit})
                    </AppText>
                    <View style={styles.statValuesRow}>
                      <AppText style={styles.statCurrentValue}>{current}</AppText>
                      <AppText style={styles.statTargetValue}>
                        {" "}
                        / {target}
                      </AppText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
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
    statsContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    statsRow: {
      flexDirection: "row",
      gap: theme.spacing.xl,
    },
    statItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    statIconBackground: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    statTextContainer: {
      flex: 1,
      gap: 2,
    },
    statLabel: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
    },
    statValuesRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    statCurrentValue: {
      ...theme.typography.Body,
      fontWeight: "600",
      color: colors.primaryText,
    },
    statTargetValue: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
    },
  });

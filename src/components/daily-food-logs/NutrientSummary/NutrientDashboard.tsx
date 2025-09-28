import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Droplet, Flame, BicepsFlexed, Wheat } from "lucide-react-native";

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

const STAT_ROWS = [[STAT_CONFIG[2], STAT_CONFIG[3]]] as const;

const RING_CONFIG = [
  { key: "calories", label: "Calories", unit: "kcal", icon: Flame },
  { key: "protein", label: "Protein", unit: "g", icon: BicepsFlexed },
] as const;

const formatDifference = (current: number, target: number) => {
  const diff = Math.round(current - target);
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
};

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
  const [ringDetailState, setRingDetailState] = useState<
    Record<"calories" | "protein", boolean>
  >({
    calories: false,
    protein: false,
  });

  // Animated values for count-up effect
  const animatedCaloriesTotal = useNumberReveal(totals.calories || 0);
  const animatedProteinTotal = useNumberReveal(totals.protein || 0);
  const animatedCaloriesTarget = useNumberReveal(targets.calories || 0);
  const animatedProteinTarget = useNumberReveal(targets.protein || 0);

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

  useEffect(() => {
    if (hasNoGoals) {
      return;
    }
    setRingDetailState({ calories: false, protein: false });
  }, [
    hasNoGoals,
    totals.calories,
    totals.protein,
    targets.calories,
    targets.protein,
  ]);

  // Trigger count-up animations when values change
  useEffect(() => {
    animatedCaloriesTotal.animateTo(totals.calories || 0);
    animatedProteinTotal.animateTo(totals.protein || 0);
    animatedCaloriesTarget.animateTo(targets.calories || 0);
    animatedProteinTarget.animateTo(targets.protein || 0);
  }, [totals.calories, totals.protein, targets.calories, targets.protein]);

  const handleToggleRing = useCallback((key: "calories" | "protein") => {
    setRingDetailState((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.ringsRow}>
        {RING_CONFIG.map((config, index) => {
          const total = totals[config.key] || 0;
          const target = targets[config.key] || 0;
          const percentage = percentages[config.key] || 0;
          const ringKey = config.key;
          const isDetail = ringDetailState[ringKey];

          // Use animated values for display
          const animatedTotal =
            config.key === "calories"
              ? animatedCaloriesTotal.display
              : animatedProteinTotal.display;
          const animatedTarget =
            config.key === "calories"
              ? animatedCaloriesTarget.display
              : animatedProteinTarget.display;

          const deltaValue =
            config.key === "protein"
              ? `${formatDifference(animatedTotal, animatedTarget)}g`
              : formatDifference(animatedTotal, animatedTarget);
          const detailValue =
            config.key === "protein"
              ? `${animatedTotal}g / ${animatedTarget}g`
              : `${animatedTotal} / ${animatedTarget}`;
          return (
            <Pressable
              key={config.key}
              onPress={() => handleToggleRing(ringKey)}
              accessibilityRole="button"
              accessibilityLabel={`${config.label} summary`}
              accessibilityHint="Toggle between delta and totals"
              style={styles.ringPressable}
            >
              <DashboardRing
                percentage={percentage}
                color={semanticColors[config.key]}
                trackColor={surfaceColors[config.key]}
                textColor={semanticColors[config.key]}
                label={config.label}
                displayValue={deltaValue}
                displayUnit={config.unit}
                detailValue={detailValue}
                detailUnit={config.unit}
                showDetail={isDetail}
                animationDelay={index * 400}
                strokeWidth={26}
                Icon={config.icon}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.statsContainer}>
        {STAT_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.statsRow}>
            {row.map((config) => {
              const Icon = config.Icon;
              const current = totals[config.key] || 0;
              const target = targets[config.key] || 0;
              return (
                <View key={config.key} style={styles.statCard}>
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
                      {`${config.label} (${config.unit})`}
                    </AppText>
                    <View style={styles.statValues}>
                      <AppText style={styles.statCurrentValue}>
                        {Math.round(current)}
                      </AppText>
                      {config.key !== "carbs" ? (
                        <AppText style={styles.statTotalValue}>
                          {" "}
                          / {Math.round(target)}
                        </AppText>
                      ) : null}
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
    ringPressable: {
      flex: 1,
      alignItems: "center",
    },
    statsContainer: {
      gap: theme.spacing.md,
    },
    statsRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
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
      gap: theme.spacing.xs,
    },
    statLabel: {
      ...theme.typography.Subhead,
      color: colors.secondaryText,
    },
    statValues: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    statCurrentValue: {
      ...theme.typography.Body,
      fontWeight: "600",
      color: colors.primaryText,
    },
    statTotalValue: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
    },
  });

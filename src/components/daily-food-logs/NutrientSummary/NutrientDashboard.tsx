import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "gram" },
] as const;

const formatDifference = (current: number, target: number) => {
  const diff = Math.round(current - target);
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
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
          const deltaValue = formatDifference(total, target);
          const detailValue = `${Math.round(total)} / ${Math.round(target)}`;
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
                displayValue={deltaValue}
                displayUnit={config.unit}
                detailValue={detailValue}
                detailUnit={config.unit}
                showDetail={isDetail}
                animationDelay={index * 120}
                strokeWidth={20}
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
                          {" "}/ {Math.round(target)}
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

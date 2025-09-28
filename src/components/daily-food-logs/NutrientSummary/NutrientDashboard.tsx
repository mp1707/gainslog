import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
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

const STAT_ROWS = [
  [STAT_CONFIG[0], STAT_CONFIG[1]],
  [STAT_CONFIG[2], STAT_CONFIG[3]],
] as const;

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

  const hasNoGoals = useMemo(() => {
    return (
      (targets.calories || 0) === 0 &&
      (targets.protein || 0) === 0 &&
      (targets.carbs || 0) === 0 &&
      (targets.fat || 0) === 0
    );
  }, [targets]);

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.ringsRow}>
        {RING_CONFIG.map((config, index) => {
          const total = totals[config.key] || 0;
          const target = targets[config.key] || 0;
          const percentage = percentages[config.key] || 0;
          return (
            <DashboardRing
              key={config.key}
              percentage={percentage}
              color={semanticColors[config.key]}
              trackColor={surfaceColors[config.key]}
              displayValue={formatDifference(total, target)}
              displayUnit={config.unit}
              animationDelay={index * 120}
              strokeWidth={22}
            />
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
                      {config.label}
                      {config.key !== "calories" ? ` (${config.unit})` : ""}
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
      justifyContent: "space-around",
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

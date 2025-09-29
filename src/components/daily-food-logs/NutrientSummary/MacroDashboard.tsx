import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Droplet, Flame, BicepsFlexed, Wheat } from "lucide-react-native";

import { AppText } from "@/components";
import { ProgressRing } from "@/components/shared/ProgressRings";
import { Colors, Theme, useTheme } from "@/theme";

import { SetGoalsCTA } from "./SetGoalsCTA";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MacroDashboardProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

type Alignment = "left" | "right";
type IconPlacement = "above" | "below";

const RING_STROKE = 22;
const RING_GAP = 2;
const OUTER_RING_SIZE = 160;
const INNER_RING_SIZE = OUTER_RING_SIZE - 2 * (RING_STROKE + RING_GAP);

const STAT_CONFIG = {
  calories: { key: "calories", label: "Calories", unit: "kcal", Icon: Flame },
  protein: { key: "protein", label: "Protein", unit: "g", Icon: BicepsFlexed },
  fat: { key: "fat", label: "Fat", unit: "g", Icon: Droplet },
  carbs: { key: "carbs", label: "Carbs", unit: "g", Icon: Wheat },
} as const;

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
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

  const renderStat = (
    key: keyof typeof STAT_CONFIG,
    align: Alignment,
    iconPlacement: IconPlacement
  ) => {
    const config = STAT_CONFIG[key];
    const Icon = config.Icon;
    const current = totals[config.key] || 0;
    const target = targets[config.key] || 0;
    const color = semanticColors[config.key];
    const backgroundColor = surfaceColors[config.key];
    const showTarget = config.key !== "carbs";

    return (
      <View
        key={config.key}
        style={[styles.statBlock, align === "right" && styles.statBlockRight]}
      >
        {iconPlacement === "above" ? (
          <View
            style={[styles.statIconWrapper, styles.statIconAbove, { backgroundColor }]}
          >
            <Icon size={18} color={color} fill={color} strokeWidth={0} />
          </View>
        ) : null}
        <View
          style={[
            styles.statTextGroup,
            align === "right" && styles.statTextGroupRight,
          ]}
        >
          <AppText
            style={[
              styles.statLabel,
              align === "right" && styles.rightAlignedText,
            ]}
          >{`${config.label} (${config.unit})`}</AppText>
          <View
            style={[
              styles.statValueRow,
              align === "right" && styles.statValueRowRight,
            ]}
          >
            <AppText
              style={[
                styles.statCurrentValue,
                align === "right" && styles.rightAlignedText,
              ]}
            >
              {Math.round(current)}
            </AppText>
            {showTarget ? (
              <AppText
                style={[
                  styles.statTargetValue,
                  align === "right" && styles.rightAlignedText,
                ]}
              >
                {" "}/ {Math.round(target)}
              </AppText>
            ) : null}
          </View>
        </View>
        {iconPlacement === "below" ? (
          <View
            style={[styles.statIconWrapper, styles.statIconBelow, { backgroundColor }]}
          >
            <Icon size={18} color={color} fill={color} strokeWidth={0} />
          </View>
        ) : null}
      </View>
    );
  };

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.dashboardRow}>
        <View style={styles.statsColumnLeft}>
          <View style={styles.statGroup}>
            {renderStat("calories", "left", "below")}
          </View>
          <View style={[styles.statGroup, styles.statGroupGap]}>
            {renderStat("fat", "left", "above")}
          </View>
        </View>
        <View style={styles.ringsColumn}>
          <View style={styles.ringsWrapper}>
            <View style={styles.outerRingCover}>
              <ProgressRing
                percentage={percentages.calories || 0}
                color={semanticColors.calories}
                trackColor={surfaceColors.calories}
                animationDelay={0}
                strokeWidth={RING_STROKE}
                size={OUTER_RING_SIZE}
                Icon={Flame}
              />
              <View style={styles.innerRingCover}>
                <ProgressRing
                  percentage={percentages.protein || 0}
                  color={semanticColors.protein}
                  trackColor={surfaceColors.protein}
                  animationDelay={200}
                  strokeWidth={RING_STROKE}
                  size={INNER_RING_SIZE}
                  Icon={BicepsFlexed}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.statsColumnRight}>
          <View style={[styles.statGroup, styles.statGroupRight]}>
            {renderStat("protein", "right", "below")}
          </View>
          <View style={[styles.statGroup, styles.statGroupRight, styles.statGroupGap]}>
            {renderStat("carbs", "right", "above")}
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    dashboardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: theme.spacing.xs,
    },
    statsColumnLeft: {
      flexShrink: 1,
      flexBasis: 108,
      minWidth: 96,
      maxWidth: 140,
      justifyContent: "space-between",
      paddingVertical: 0,
      alignItems: "flex-start",
    },
    statsColumnRight: {
      flexShrink: 1,
      flexBasis: 108,
      minWidth: 96,
      maxWidth: 140,
      justifyContent: "space-between",
      paddingVertical: 0,
      alignItems: "flex-end",
    },
    statGroup: {
      gap: theme.spacing.xs,
      alignItems: "flex-start",
      width: "100%",
    },
    statGroupRight: {
      alignItems: "flex-end",
      width: "100%",
    },
    statGroupGap: {
      marginTop: theme.spacing.xs,
    },
    statBlock: {
      gap: theme.spacing.xs,
      alignItems: "flex-start",
      width: "100%",
    },
    statBlockRight: {
      alignItems: "flex-end",
      width: "100%",
    },
    statIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    statIconAbove: {
      marginBottom: theme.spacing.xs,
    },
    statIconBelow: {
      marginTop: theme.spacing.xs,
    },
    statTextGroup: {
      gap: theme.spacing.xs,
      alignItems: "flex-start",
    },
    statTextGroupRight: {
      alignItems: "flex-end",
    },
    statLabel: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
    },
    statValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "flex-start",
    },
    statValueRowRight: {
      justifyContent: "flex-end",
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
    rightAlignedText: {
      textAlign: "right",
    },
    ringsColumn: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: OUTER_RING_SIZE,
      flexGrow: 0,
      flexBasis: OUTER_RING_SIZE,
      flexShrink: 0,
      marginHorizontal: theme.spacing.xs,
    },
    ringsWrapper: {
      width: OUTER_RING_SIZE,
      height: OUTER_RING_SIZE,
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
      alignSelf: "center",
    },
    outerRingCover: {
      width: OUTER_RING_SIZE,
      height: OUTER_RING_SIZE,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "visible",
    },
    innerRingCover: {
      position: "absolute",
      top: (OUTER_RING_SIZE - INNER_RING_SIZE) / 2,
      left: (OUTER_RING_SIZE - INNER_RING_SIZE) / 2,
      width: INNER_RING_SIZE,
      height: INNER_RING_SIZE,
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
    },
  });

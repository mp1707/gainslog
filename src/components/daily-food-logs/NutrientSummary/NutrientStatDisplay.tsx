import React from "react";
import { View, StyleSheet } from "react-native";
import { Flame, BicepsFlexed, Droplet, Zap, ChevronDown, ChevronsDown } from "lucide-react-native";

import { NutrientLabel } from "./components/NutrientLabel";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Theme, useTheme } from "@/theme";
import { getNutrientIcon } from "./utils/nutrientFormatters";

interface CaloriesRingDisplayProps {
  total: number;
  target: number;
  percentage: number;
}

export const CaloriesRingDisplay: React.FC<CaloriesRingDisplayProps> = ({
  total,
  target,
  percentage,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  const delta = target - total;
  const isOver = total >= target;
  const label = isOver ? "over" : "remaining";
  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;

  return (
    <View style={styles.block}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.calories}
        trackColor={colors.semanticSurfaces.calories}
        textColor={colors.primaryText}
        label="Calories"
        displayValue={Math.abs(delta).toString()}
        displayUnit=""
        detailValue={label}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <NutrientLabel
        Icon={Flame}
        iconColor={colors.semantic.calories}
        iconFill={colors.semantic.calories}
        label="Calories"
        currentValue={total}
        targetValue={target}
        unit="kcal"
        style={styles.inlineLabel}
      />
    </View>
  );
};

interface ProteinRingDisplayProps {
  total: number;
  target: number;
  percentage: number;
}

export const ProteinRingDisplay: React.FC<ProteinRingDisplayProps> = ({
  total,
  target,
  percentage,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  const delta = target - total;
  const isOver = total >= target;
  const label = isOver ? "over" : "remaining";
  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;
  const IconComponent = getNutrientIcon(BicepsFlexed, percentage >= 100, "protein");
  const iconFill = percentage >= 100
    ? colors.semanticSurfaces.protein
    : colors.semantic.protein;
  const iconStrokeWidth = percentage >= 100 ? 2 : 0;

  return (
    <View style={styles.block}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.protein}
        trackColor={colors.semanticSurfaces.protein}
        textColor={colors.primaryText}
        label="Protein"
        displayValue={Math.abs(delta).toString()}
        displayUnit=""
        detailValue={label}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <NutrientLabel
        Icon={IconComponent}
        iconColor={colors.semantic.protein}
        iconFill={iconFill}
        iconStrokeWidth={iconStrokeWidth}
        label="Protein"
        currentValue={total}
        targetValue={target}
        unit="g"
        style={styles.inlineLabel}
      />
    </View>
  );
};

interface FatProgressDisplayProps {
  total: number;
  target: number;
}

export const FatProgressDisplay: React.FC<FatProgressDisplayProps> = ({
  total,
  target,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.statWrapper}>
      <NutrientLabel
        Icon={Droplet}
        iconColor={colors.semantic.fat}
        iconFill={colors.semantic.fat}
        label="Fat"
        currentValue={total}
        targetValue={target}
        unit="g"
        style={styles.inlineLabel}
      />
    </View>
  );
};

interface CarbsStatDisplayProps {
  total: number;
}

export const CarbsStatDisplay: React.FC<CarbsStatDisplayProps> = ({ total }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.statWrapper}>
      <NutrientLabel
        Icon={Zap}
        iconColor={colors.semantic.carbs}
        iconFill={colors.semantic.carbs}
        label="Carbs"
        currentValue={total}
        unit="g"
        style={styles.inlineLabel}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    block: {
      alignItems: "center",
      gap: theme.spacing.md,
    },
    inlineLabel: {
      marginLeft: 0,
    },
    statWrapper: {
      paddingVertical: theme.spacing.xs,
    },
  });

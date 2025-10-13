import React from "react";
import { View, StyleSheet } from "react-native";
import { Flame, BicepsFlexed, Droplet, Zap, ChevronDown, ChevronsDown } from "lucide-react-native";

import { NutrientLabel } from "./components/NutrientLabel";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Theme, useTheme } from "@/theme";
import { getNutrientIcon } from "./utils/nutrientFormatters";
import { AppText } from "@/components";

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

  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;

  return (
    <View style={styles.block}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.calories}
        trackColor={colors.semanticSurfaces.calories}
        textColor={colors.primaryText}
        label="Calories"
        displayValue={total}
        displayUnit=""
        detailValue={`of ${target}kcal target`}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <View style={styles.ringFooter}>
        <Flame size={22} color={colors.semantic.calories} fill={colors.semantic.calories} />
        <AppText role="Subhead" color="secondary">
          Calories (kcal)
        </AppText>
      </View>
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
        displayValue={total}
        displayUnit=""
        detailValue={`of ${target}g target`}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <View style={styles.ringFooter}>
        <IconComponent
          size={22}
          color={colors.semantic.protein}
          fill={iconFill}
          strokeWidth={iconStrokeWidth}
        />
        <AppText role="Subhead" color="secondary">
          Protein (g)
        </AppText>
      </View>
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
    ringFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    inlineLabel: {
      marginLeft: 0,
    },
    statWrapper: {
      paddingVertical: theme.spacing.xs,
    },
  });

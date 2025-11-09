import React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;
  const caloriesLabel = t("nutrients.calories.label");
  const caloriesUnit = t("nutrients.calories.unitShort");
  const detailValue = t("dailyFoodLogs.nutrientStatDisplay.detailValue", {
    target,
    unit: caloriesUnit,
  });
  const footerLabel = t("dailyFoodLogs.nutrientStatDisplay.labelWithUnit", {
    label: caloriesLabel,
    unit: caloriesUnit,
  });

  return (
    <View style={styles.block}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.calories}
        trackColor={colors.semanticSurfaces.calories}
        textColor={colors.primaryText}
        label={caloriesLabel}
        displayValue={total}
        displayUnit=""
        detailValue={detailValue}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <View style={styles.ringFooter}>
        <Flame size={22} color={colors.semantic.calories} fill={colors.semantic.calories} />
        <AppText role="Subhead" color="secondary">
          {footerLabel}
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
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;
  const IconComponent = getNutrientIcon(BicepsFlexed, percentage >= 100, "protein");
  const iconFill = percentage >= 100
    ? colors.semanticSurfaces.protein
    : colors.semantic.protein;
  const iconStrokeWidth = percentage >= 100 ? 2 : 0;
  const proteinLabel = t("nutrients.protein.label");
  const proteinUnit = t("nutrients.protein.unitShort");
  const detailValue = t("dailyFoodLogs.nutrientStatDisplay.detailValue", {
    target,
    unit: proteinUnit,
  });
  const footerLabel = t("dailyFoodLogs.nutrientStatDisplay.labelWithUnit", {
    label: proteinLabel,
    unit: proteinUnit,
  });

  return (
    <View style={styles.block}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.protein}
        trackColor={colors.semanticSurfaces.protein}
        textColor={colors.primaryText}
        label={proteinLabel}
        displayValue={total}
        displayUnit=""
        detailValue={detailValue}
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
          {footerLabel}
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
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const fatUnit = t("nutrients.fat.unitShort");

  return (
    <View style={styles.statWrapper}>
      <NutrientLabel
        Icon={Droplet}
        iconColor={colors.semantic.fat}
        iconFill={colors.semantic.fat}
        label={t("nutrients.fat.label")}
        currentValue={total}
        targetValue={target}
        unit={fatUnit}
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
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const carbsUnit = t("nutrients.carbs.unitShort");

  return (
    <View style={styles.statWrapper}>
      <NutrientLabel
        Icon={Zap}
        iconColor={colors.semantic.carbs}
        iconFill={colors.semantic.carbs}
        label={t("nutrients.carbs.label")}
        currentValue={total}
        unit={carbsUnit}
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

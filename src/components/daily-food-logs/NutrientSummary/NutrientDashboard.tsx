import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { theme, Theme, useTheme } from "@/theme";
import { SetGoalsCTA } from "./SetGoalsCTA";
import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { useNutrientCalculations } from "./hooks/useNutrientCalculations";
import { useNutrientAnimations } from "./hooks/useNutrientAnimations";
import { useNutrientNavigation } from "./hooks/useNutrientNavigation";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import {
  RING_CONFIG,
  NUTRIENT_LABELS,
  ANIMATION_DELAYS,
  type NutrientKey,
} from "./utils/constants";
import { getChevronIcon, getNutrientIcon } from "./utils/nutrientFormatters";

const ICON_SIZE = 22;
const ICON_GAP = theme.spacing.md;
const ICON_SPACE = ICON_SIZE + ICON_GAP;

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

const RING_KEYS = ["calories", "protein"] as const;
const LABEL_GROUPS: Record<(typeof RING_KEYS)[number], NutrientKey[]> = {
  calories: ["calories", "fat"],
  protein: ["protein", "carbs"],
};

/**
 * Dashboard displaying nutrient intake progress with ring and label visualizations.
 */
export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const hasNoGoals =
    (targets.calories || 0) === 0 &&
    (targets.protein || 0) === 0 &&
    (targets.carbs || 0) === 0 &&
    (targets.fat || 0) === 0;

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColors = useMemo(
    () =>
      ({
        calories: colors.semantic.calories,
        protein: colors.semantic.protein,
        carbs: colors.semantic.carbs,
        fat: colors.semantic.fat,
      } as Record<NutrientKey, string>),
    [colors]
  );

  const surfaceColors = useMemo(
    () =>
      ({
        calories: colors.semanticSurfaces.calories,
        protein: colors.semanticSurfaces.protein,
        carbs: colors.semanticSurfaces.carbs,
        fat: colors.semanticSurfaces.fat,
      } as Record<NutrientKey, string>),
    [colors]
  );

  const calculations = useNutrientCalculations({
    totals,
    targets,
    percentages,
  });

  const animations = useNutrientAnimations({
    totals,
    percentages,
    isProteinComplete: calculations.isProteinComplete,
  });

  const { handleOpenExplainer } = useNutrientNavigation({
    totals,
    targets,
    percentages,
  });

  const caloriesPressAnimation = usePressAnimation();
  const proteinPressAnimation = usePressAnimation();

  const ringPressAnimations = {
    calories: caloriesPressAnimation,
    protein: proteinPressAnimation,
  } as const;

  const animatedTotals: Record<NutrientKey, number> = {
    calories: animations.animatedCaloriesTotal,
    protein: animations.animatedProteinTotal,
    fat: animations.animatedFatTotal,
    carbs: animations.animatedCarbsTotal,
  };

  const labelTargets: Partial<Record<NutrientKey, number>> = {
    calories: Math.round(targets.calories || 0),
    protein: Math.round(targets.protein || 0),
    fat: Math.round(targets.fat || 0),
  };

  return (
    <View style={styles.container}>
      <View style={styles.ringRow}>
        {RING_KEYS.map((ringKey, index) => {
          const ringConfig = RING_CONFIG.find((item) => item.key === ringKey)!;
          const ringPercentage = percentages[ringKey] || 0;
          const chevronIcon = getChevronIcon(ringPercentage);
          const { handlePressIn, handlePressOut, pressAnimatedStyle } =
            ringPressAnimations[ringKey];
          const ringTarget = labelTargets[ringKey];
          const ringDetailValue =
            typeof ringTarget === "number" ? `of ${ringTarget}` : undefined;
          const labelKeys = LABEL_GROUPS[ringKey];

          return (
            <View key={ringKey} style={styles.ringCell}>
              <Pressable
                onPress={() => handleOpenExplainer(ringKey)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.ringPressable}
              >
                <Animated.View style={pressAnimatedStyle}>
                  <DashboardRing
                    label={ringConfig.label}
                    displayUnit={ringConfig.unit}
                    detailUnit=""
                    showDetail={false}
                    percentage={ringPercentage}
                    color={semanticColors[ringKey]}
                    trackColor={surfaceColors[ringKey]}
                    textColor={colors.primaryText}
                    displayValue={animatedTotals[ringKey]}
                    detailValue={ringDetailValue}
                    animationDelay={index * ANIMATION_DELAYS.RING_STAGGER}
                    strokeWidth={18}
                    Icon={chevronIcon}
                    skipAnimation={animations.dateChanged}
                  />
                </Animated.View>
              </Pressable>
              <View style={styles.labelGroup}>
                {labelKeys.map((labelKey) => {
                  const config = NUTRIENT_LABELS[labelKey];
                  const iconScale =
                    labelKey === "protein"
                      ? animations.proteinIconScale
                      : undefined;

                  const {
                    iconColor,
                    iconFill,
                    iconStrokeWidth,
                    IconComponent,
                  } = getLabelIconConfig({
                    labelKey,
                    config,
                    semanticColors,
                    surfaceColors,
                    calculations,
                  });

                  const totalValue =
                    labelKey === "fat" || labelKey === "carbs"
                      ? animatedTotals[labelKey]
                      : undefined;
                  const targetValue =
                    labelKey === "fat" ? labelTargets.fat : undefined;
                  const unit =
                    labelKey === "fat" || labelKey === "carbs"
                      ? config.unit
                      : undefined;

                  return (
                    <View key={labelKey} style={styles.labelItem}>
                      <NutrientSummaryLabel
                        Icon={IconComponent}
                        iconScale={iconScale}
                        iconColor={iconColor}
                        iconFill={iconFill}
                        iconStrokeWidth={iconStrokeWidth}
                        label={config.label}
                        unit={unit}
                        totalValue={totalValue}
                        targetValue={targetValue}
                        onPress={() => handleOpenExplainer(labelKey)}
                      />
                    </View>
                  );
                })}
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
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    ringRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.lg,
    },
    ringCell: {
      flex: 1,
      alignItems: "center",
    },
    ringPressable: {
      width: "100%",
      alignItems: "center",
    },
    labelGroup: {
      marginTop: theme.spacing.md,
      alignSelf: "center",
      alignItems: "stretch",
      gap: theme.spacing.xl,
      maxWidth: 240,
    },
    labelItem: {
      width: "100%",
      alignSelf: "stretch",
    },
  });

interface LabelIconConfigParams {
  labelKey: NutrientKey;
  config: (typeof NUTRIENT_LABELS)[NutrientKey];
  semanticColors: Record<NutrientKey, string>;
  surfaceColors: Record<NutrientKey, string>;
  calculations: ReturnType<typeof useNutrientCalculations>;
}

interface LabelIconConfigResult {
  IconComponent:
    | LucideIcon
    | React.ComponentType<{
        size: number;
        color: string;
        fill?: string;
        strokeWidth?: number;
      }>;
  iconColor: string;
  iconFill?: string;
  iconStrokeWidth: number;
}

const getLabelIconConfig = ({
  labelKey,
  config,
  semanticColors,
  surfaceColors,
  calculations,
}: LabelIconConfigParams): LabelIconConfigResult => {
  if (labelKey === "protein") {
    const isComplete = calculations.isProteinComplete;

    return {
      IconComponent: getNutrientIcon(config.Icon, isComplete, "protein"),
      iconColor: semanticColors.protein,
      iconFill: isComplete ? surfaceColors.protein : semanticColors.protein,
      iconStrokeWidth: isComplete ? 2 : 0,
    };
  }

  if (labelKey === "calories") {
    return {
      IconComponent: getNutrientIcon(config.Icon, false, "calories"),
      iconColor: semanticColors.calories,
      iconFill: semanticColors.calories,
      iconStrokeWidth: 0,
    };
  }

  return {
    IconComponent: config.Icon,
    iconColor: semanticColors[labelKey],
    iconFill: semanticColors[labelKey],
    iconStrokeWidth: 0,
  };
};

interface NutrientSummaryLabelProps {
  Icon:
    | LucideIcon
    | React.ComponentType<{
        size: number;
        color: string;
        fill?: string;
        strokeWidth?: number;
      }>;
  iconScale?: SharedValue<number>;
  iconColor: string;
  iconFill?: string;
  iconStrokeWidth?: number;
  label: string;
  unit?: string;
  totalValue?: number | string;
  targetValue?: number | string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const NutrientSummaryLabel: React.FC<NutrientSummaryLabelProps> = ({
  Icon,
  iconScale,
  iconColor,
  iconFill,
  iconStrokeWidth = 0,
  label,
  unit,
  totalValue,
  targetValue,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const labelStyles = useMemo(() => createLabelStyles(theme), [theme]);
  const { handlePressIn, handlePressOut, pressAnimatedStyle } =
    usePressAnimation({
      disabled: !onPress,
    });

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale ? iconScale.value : 1 }],
  }));

  const labelContent = (
    <View style={[labelStyles.container, style]}>
      <Animated.View style={[labelStyles.iconWrapper, iconAnimatedStyle]}>
        <Icon
          size={22}
          color={iconColor}
          fill={iconFill}
          strokeWidth={iconStrokeWidth}
        />
      </Animated.View>
      <View style={labelStyles.textContainer}>
        <AppText role="Subhead" color="secondary">
          {label}
        </AppText>
        {totalValue != null ? (
          <View style={labelStyles.valuesRow}>
            <AppText role="Headline" color="primary">
              {totalValue}
            </AppText>
            {targetValue != null ? (
              <>
                <AppText role="Body" color="secondary">
                  /
                </AppText>
                <AppText role="Body" color="secondary">
                  {targetValue}
                  {unit}
                </AppText>
              </>
            ) : unit ? (
              <AppText
                role="Body"
                color="secondary"
                style={labelStyles.unitSpacing}
              >
                {unit}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return labelContent;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={pressAnimatedStyle}>{labelContent}</Animated.View>
    </Pressable>
  );
};

const createLabelStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: ICON_GAP,
      flexShrink: 0,
      marginLeft: -ICON_SPACE,
    },
    iconWrapper: {
      justifyContent: "center",
      alignItems: "center",
    },
    textContainer: {
      gap: theme.spacing.xs / 2,
    },
    valuesRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: theme.spacing.xs,
    },
    unitSpacing: {
      marginBottom: 2,
    },
  });

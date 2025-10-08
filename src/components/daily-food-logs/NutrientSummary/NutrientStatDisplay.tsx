import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Flame,
  BicepsFlexed,
  Droplet,
  Zap,
  ChevronDown,
  ChevronsDown,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react-native";

import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { Theme, useTheme } from "@/theme";

// Static Calories Ring Display (no animations)
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
    <View style={styles.ringContainer}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.calories}
        trackColor={colors.semanticSurfaces.calories}
        textColor={colors.primaryText}
        label="Calories (kcal)"
        displayValue={Math.abs(delta).toString()}
        displayUnit=""
        detailValue={label}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <View style={styles.ringLabelContainer}>
        <View style={styles.ringLabelHeader}>
          <Flame
            size={20}
            color={colors.semantic.calories}
            fill={colors.semantic.calories}
            strokeWidth={0}
          />
          <AppText role="Caption" color="secondary">
            Calories (kcal)
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
    </View>
  );
};

// Static Protein Ring Display (no animations)
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
  const isComplete = percentage >= 100;
  const LabelIcon = isComplete ? CircleCheckBig : BicepsFlexed;

  return (
    <View style={styles.ringContainer}>
      <DashboardRing
        percentage={percentage}
        color={colors.semantic.protein}
        trackColor={colors.semanticSurfaces.protein}
        textColor={colors.primaryText}
        label="Protein (g)"
        displayValue={Math.abs(delta).toString()}
        displayUnit=""
        detailValue={label}
        detailUnit=""
        showDetail={false}
        animationDelay={0}
        strokeWidth={20}
        Icon={ChevronIcon}
      />
      <View style={styles.ringLabelContainer}>
        <View style={styles.ringLabelHeader}>
          <LabelIcon
            size={20}
            color={colors.semantic.protein}
            fill={
              isComplete
                ? colors.semanticSurfaces.protein
                : colors.semantic.protein
            }
            strokeWidth={isComplete ? 2 : 0}
          />
          <AppText role="Caption" color="secondary">
            Protein (g)
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
    </View>
  );
};

// Static Fat Progress Bar Display (no animations)
interface FatProgressDisplayProps {
  total: number;
  target: number;
  percentage: number;
  caloriesTarget: number; // Added to calculate max range
}

export const FatProgressDisplay: React.FC<FatProgressDisplayProps> = ({
  total,
  target,
  percentage,
  caloriesTarget,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  // Calculate fat gram ranges (20-35%)
  const fatMinGrams = target; // 20% minimum
  const fatMaxGrams = caloriesTarget
    ? Math.round((caloriesTarget * 0.35) / 9) // 35% maximum
    : 0;

  // Determine icon state based on gram ranges
  const isFatInRange = total >= fatMinGrams && total <= fatMaxGrams;
  const isFatAboveMax = total > fatMaxGrams && fatMaxGrams > 0;

  // Select icon based on state
  let StatIcon = Droplet;
  let iconColor: string = colors.semantic.fat;
  let iconFill: string = colors.semantic.fat;
  let iconStrokeWidth = 0;

  if (isFatAboveMax) {
    StatIcon = TriangleAlert;
    iconColor = colors.warning;
    iconFill = colors.warningBackground;
    iconStrokeWidth = 2;
  } else if (isFatInRange) {
    StatIcon = CircleCheckBig;
    iconColor = colors.semantic.fat;
    iconFill = colors.semanticSurfaces.fat;
    iconStrokeWidth = 2;
  }

  return (
    <View style={styles.statItemWrapper}>
      <View style={styles.statRow}>
        <StatIcon
          size={20}
          color={iconColor}
          fill={iconFill}
          strokeWidth={iconStrokeWidth}
        />
        <View style={styles.statContent}>
          <View style={styles.statHeader}>
            <View style={styles.statLabelContainer}>
              <AppText role="Caption" color="secondary">
                Fat (g)
              </AppText>
              {fatMinGrams > 0 && (
                <AppText role="Caption" color="secondary">
                  Baseline {fatMinGrams}-{fatMaxGrams}g
                </AppText>
              )}
            </View>
            <View style={styles.statValue}>
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
          {target > 0 && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.semanticSurfaces.fat },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: colors.semantic.fat,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Static Carbs Stat Display (no animations)
interface CarbsStatDisplayProps {
  total: number;
}

export const CarbsStatDisplay: React.FC<CarbsStatDisplayProps> = ({
  total,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.statItemWrapper}>
      <View style={styles.statRow}>
        <Zap
          size={20}
          color={colors.semantic.carbs}
          fill={colors.semantic.carbs}
          strokeWidth={0}
        />
        <View style={styles.statContent}>
          <View style={styles.statHeader}>
            <AppText role="Caption" color="secondary">
              Carbs (g)
            </AppText>
            <View style={styles.statValue}>
              <AppText role="Body" color="secondary">
                {total}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    ringContainer: {
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

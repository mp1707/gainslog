import React, { useMemo, useEffect } from "react";
import { View, StyleSheet, Platform, UIManager } from "react-native";
import { useSharedValue, withSpring, withDelay } from "react-native-reanimated";
import { Colors, Theme, useTheme } from "@/theme";
import { AppText } from "@/components";
import { Droplet, Flame, BicepsFlexed, Wheat } from "lucide-react-native";
import { ProgressRings } from "@/components/shared/ProgressRings";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interfaces and Configs remain the same
interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
interface NutrientSummaryProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
const RING_CONFIG = [
  { key: "calories", colorKey: "calories" as const, label: "Calories" },
  { key: "protein", colorKey: "protein" as const, label: "Protein" },
  { key: "carbs", colorKey: "carbs" as const, label: "Carbs" },
  { key: "fat", colorKey: "fat" as const, label: "Fat" },
] as const;
const STROKE_WIDTH = 16;
const RING_SPACING = 2;

// Helper components remain the same
const getIcon = (label: string, color: string) => {
  switch (label) {
    case "Calories":
      return <Flame size={20} color={color} fill={color} strokeWidth={0} />;
    case "Protein":
      return (
        <BicepsFlexed size={20} color={color} fill={color} strokeWidth={0} />
      );
    case "Carbs":
      return <Wheat size={20} color={color} fill={color} strokeWidth={0} />;
    case "Fat":
      return <Droplet size={20} color={color} fill={color} strokeWidth={0} />;
    default:
      return null;
  }
};
const StatRow = ({
  color,
  label,
  current,
  total,
  unit,
}: {
  color: string;
  label: string;
  current: number;
  total: number;
  unit: string;
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  return (
    <View style={styles.statRow}>
      <View
        style={[styles.statIconBackground, { backgroundColor: color + "20" }]}
      >
        {getIcon(label, color)}
      </View>
      <View style={styles.statTextContainer}>
        <AppText style={styles.statLabel}>{label}</AppText>
        <View style={styles.statValues}>
          <AppText style={styles.statCurrentValue}>
            {Math.round(current)}
          </AppText>
          <AppText style={styles.statTotalValue}>
            {" "}
            / {Math.round(total)}
            {unit}
          </AppText>
        </View>
      </View>
    </View>
  );
};

// --- MAIN HEADER COMPONENT ---
export const NutrientSummary: React.FC<NutrientSummaryProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const containerSize = 175;
  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    const safePercentages = {
      calories: percentages.calories || 0,
      protein: percentages.protein || 0,
      carbs: percentages.carbs || 0,
      fat: percentages.fat || 0,
    };
    const targetValues = {
      calories: Math.min(1, Math.max(0, safePercentages.calories / 100)),
      protein: Math.min(1, Math.max(0, safePercentages.protein / 100)),
      carbs: Math.min(1, Math.max(0, safePercentages.carbs / 100)),
      fat: Math.min(1, Math.max(0, safePercentages.fat / 100)),
    };
    progress.value = {
      calories: withDelay(0, withSpring(targetValues.calories)),
      protein: withDelay(100, withSpring(targetValues.protein)),
      carbs: withDelay(200, withSpring(targetValues.carbs)),
      fat: withDelay(300, withSpring(targetValues.fat)),
    };
  }, [percentages, progress]);

  const ringColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  };

  // --- RENDER ---
  return (
    <View style={styles.plateContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.summaryContent}>
          <ProgressRings
            percentages={percentages}
            size={containerSize}
            strokeWidth={STROKE_WIDTH}
            spacing={RING_SPACING}
          />
          <View style={styles.statsContainer}>
            {RING_CONFIG.map((config) => (
              <StatRow
                key={config.key}
                color={ringColors[config.colorKey]}
                label={config.label}
                current={totals[config.key] || 0}
                total={targets[config.key] || 0}
                unit={config.key === "calories" ? "kcal" : "g"}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// --- STYLESHEET ---
const createStyles = (colors: Colors, theme: Theme) => {
  return StyleSheet.create({
    plateContainer: {
      paddingBottom: theme.spacing.lg,
    },
    headingContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    dayHeading: {
      ...theme.typography.Title2,
      color: colors.primaryText,
      textAlign: "center",
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    summaryContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    ringsContainer: {},
    statsContainer: { flex: 1, gap: theme.spacing.sm },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    statIconBackground: { borderRadius: 100, padding: theme.spacing.sm },
    statTextContainer: { flex: 1 },
    statLabel: {
      ...theme.typography.Body,
      color: colors.secondaryText,
      marginBottom: 2,
    },
    statValues: { flexDirection: "row", alignItems: "baseline" },
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
};

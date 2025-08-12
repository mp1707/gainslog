import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { Card, AppText, ProgressRow } from "@/components";
import { useStyles } from "./DailySummaryCard.styles";

// Memoized date formatter to avoid repeated date processing
const formatDate = (dateString: string): string => {
  const d = new Date(dateString + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${d.getDate()}. ${month}`;
};

// Memoized component for better performance
export const DailySummaryCard = React.memo(function DailySummaryCard({
  dateIso,
  calories,
  protein,
  carbs,
  fat,
  onPress,
  visible = { calories: true, protein: true, carbs: true, fat: true },
}: {
  dateIso: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onPress: () => void;
  visible?: {
    calories: boolean;
    protein: boolean;
    carbs: boolean;
    fat: boolean;
  };
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  // Memoize formatted date to avoid recalculation
  const formattedDate = useMemo(() => formatDate(dateIso), [dateIso]);

  // Animations removed

  // Pre-calculate colors with null safety
  const semanticColors = useMemo(() => {
    const semantic = colors?.semantic || {};
    return {
      calories: semantic.calories || "#FF7A5A",
      protein: semantic.protein || "#4ECDC4",
      carbs: semantic.carbs || "#45B7D1",
      fat: semantic.fat || "#FFA726",
    };
  }, [colors?.semantic]);

  // Add null safety for visible prop
  const safeVisible = visible || {
    calories: false,
    protein: false,
    carbs: false,
    fat: false,
  };

  // Memoize accessibility label with simplified dependencies
  const accessibilityLabel = useMemo(() => {
    const parts: string[] = [];
    if (safeVisible.calories)
      parts.push(`Calories ${Math.round(calories)} percent`);
    if (safeVisible.protein)
      parts.push(`Protein ${Math.round(protein)} percent`);
    if (safeVisible.carbs) parts.push(`Carbs ${Math.round(carbs)} percent`);
    if (safeVisible.fat) parts.push(`Fat ${Math.round(fat)} percent`);
    return `"${formattedDate}"${parts.length ? ", " + parts.join(", ") : ""}`;
  }, [formattedDate, safeVisible, calories, protein, carbs, fat]);

  // Optimized metrics rendering with simplified dependencies
  const metricsContent = useMemo(() => {
    const metrics: React.ReactNode[] = [];

    if (safeVisible.calories) {
      metrics.push(
        <ProgressRow
          key="calories"
          label="Calories"
          value={calories}
          color={semanticColors.calories}
        />
      );
    }
    if (safeVisible.protein) {
      metrics.push(
        <ProgressRow
          key="protein"
          label="Protein"
          value={protein}
          color={semanticColors.protein}
        />
      );
    }
    if (safeVisible.carbs) {
      metrics.push(
        <ProgressRow
          key="carbs"
          label="Carbs"
          value={carbs}
          color={semanticColors.carbs}
        />
      );
    }
    if (safeVisible.fat) {
      metrics.push(
        <ProgressRow
          key="fat"
          label="Fat"
          value={fat}
          color={semanticColors.fat}
        />
      );
    }

    // Add gaps between metrics efficiently
    const result: React.ReactNode[] = [];
    metrics.forEach((metric, index) => {
      result.push(metric);
      if (index < metrics.length - 1) {
        result.push(<View key={`gap-${index}`} style={styles.rowGap} />);
      }
    });

    return result;
  }, [
    safeVisible,
    calories,
    protein,
    carbs,
    fat,
    semanticColors,
    styles.rowGap,
  ]);

  return (
    <Pressable
      onPress={onPress}
      // animations removed
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View style={styles.cardContainer}>
        <Card elevated={false}>
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Headline">{formattedDate}</AppText>
            </View>
            <View style={styles.metricsColumn}>{metricsContent}</View>
          </View>
        </Card>
      </View>
    </Pressable>
  );
});

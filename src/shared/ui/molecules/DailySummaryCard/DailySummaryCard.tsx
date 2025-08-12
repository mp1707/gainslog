import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { Card, AppText, ProgressRow } from "src/components";
import { useStyles } from "./DailySummaryCard.styles";

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

  // Format date like "12. Aug"
  const formatDate = (dateString: string): string => {
    const d = new Date(dateString + "T00:00:00");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    return `${d.getDate()}. ${month}`;
  };

  // Single press animation - optimized for performance
  const pressScale = useSharedValue(1);

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, {
      damping: 15,
      stiffness: 400,
      // Use native driver for better performance
      mass: 0.8,
    });
  };

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: pressScale.value }],
    }),
    []
  );

  // Pre-calculate colors for better performance
  const semanticColors = useMemo(
    () => ({
      calories: colors.semantic.calories,
      protein: colors.semantic.protein,
      carbs: colors.semantic.carbs,
      fat: colors.semantic.fat,
    }),
    [colors.semantic]
  );

  // Create accessibility label once
  const accessibilityLabel = useMemo(() => {
    const parts: string[] = [];
    if (visible?.calories)
      parts.push(`Calories ${Math.round(calories)} percent`);
    if (visible?.protein) parts.push(`Protein ${Math.round(protein)} percent`);
    if (visible?.carbs) parts.push(`Carbs ${Math.round(carbs)} percent`);
    if (visible?.fat) parts.push(`Fat ${Math.round(fat)} percent`);
    return `"${formatDate(dateIso)}"${
      parts.length ? ", " + parts.join(", ") : ""
    }`;
  }, [dateIso, visible, calories, protein, carbs, fat]);

  // Render metrics efficiently
  const renderMetrics = () => {
    const metrics = [];
    if (visible.calories) {
      metrics.push(
        <ProgressRow
          key="calories"
          label="Calories"
          value={calories}
          color={semanticColors.calories}
        />
      );
    }
    if (visible.protein) {
      metrics.push(
        <ProgressRow
          key="protein"
          label="Protein"
          value={protein}
          color={semanticColors.protein}
        />
      );
    }
    if (visible.carbs) {
      metrics.push(
        <ProgressRow
          key="carbs"
          label="Carbs"
          value={carbs}
          color={semanticColors.carbs}
        />
      );
    }
    if (visible.fat) {
      metrics.push(
        <ProgressRow
          key="fat"
          label="Fat"
          value={fat}
          color={semanticColors.fat}
        />
      );
    }

    // Add gaps between metrics
    return metrics.reduce((acc: React.ReactNode[], metric, index) => {
      acc.push(metric);
      if (index < metrics.length - 1) {
        acc.push(<View key={`gap-${index}`} style={styles.rowGap} />);
      }
      return acc;
    }, []);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
        <Card>
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Headline">{formatDate(dateIso)}</AppText>
            </View>
            <View style={styles.metricsColumn}>{renderMetrics()}</View>
          </View>
        </Card>
      </Animated.View>
    </Pressable>
  );
});

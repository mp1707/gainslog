import React, { useMemo, useEffect } from "react";
import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { Card, AppText } from "@/components";
import { useStyles } from "./DailySummaryCard.styles";
import { ProgressRow } from "./ProgressRow";

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

  // Press animation shared values
  const pressScale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);

  // Progress bar animation shared values
  const caloriesProgress = useSharedValue(0);
  const proteinProgress = useSharedValue(0);
  const carbsProgress = useSharedValue(0);
  const fatProgress = useSharedValue(0);

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

  // Press animation styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const pressFlashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressFlashOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  // Add null safety for visible prop
  const safeVisible = visible || {
    calories: false,
    protein: false,
    carbs: false,
    fat: false,
  };

  // Trigger staggered progress bar animations
  useEffect(() => {
    const animationConfig = {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    };

    // Reset all progress bars to 0 first
    caloriesProgress.value = 0;
    proteinProgress.value = 0;
    carbsProgress.value = 0;
    fatProgress.value = 0;

    // Staggered animations with 50ms delay between each
    if (safeVisible.calories) {
      caloriesProgress.value = withDelay(0, withTiming(1, animationConfig));
    }
    if (safeVisible.protein) {
      proteinProgress.value = withDelay(50, withTiming(1, animationConfig));
    }
    if (safeVisible.carbs) {
      carbsProgress.value = withDelay(100, withTiming(1, animationConfig));
    }
    if (safeVisible.fat) {
      fatProgress.value = withDelay(150, withTiming(1, animationConfig));
    }
  }, [dateIso, safeVisible]); // Trigger on date change or visibility change

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
          animatedProgress={caloriesProgress}
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
          animatedProgress={proteinProgress}
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
          animatedProgress={carbsProgress}
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
          animatedProgress={fatProgress}
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
    caloriesProgress,
    proteinProgress,
    carbsProgress,
    fatProgress,
  ]);

  // Press handlers for animation
  const handlePressIn = () => {
    // Press down animation - scale down and flash
    pressScale.value = withTiming(0.97, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
    pressFlashOpacity.value = withTiming(0.08, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    // Release animation - spring back and fade flash
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
    pressFlashOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <Card elevated={false}>
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Subhead" style={{ color: colors.secondaryText }}>
                {formattedDate}
              </AppText>
            </View>
            <View style={styles.metricsColumn}>{metricsContent}</View>
          </View>
        </Card>
        
        {/* Press flash overlay for press feedback */}
        <Animated.View
          style={[styles.pressOverlay, pressFlashAnimatedStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
});

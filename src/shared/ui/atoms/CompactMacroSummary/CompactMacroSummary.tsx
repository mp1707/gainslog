import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./CompactMacroSummary.styles";

interface CompactMacroSummaryProps {
  protein: number;
  carbs: number;
  fat: number;
}

export const CompactMacroSummary: React.FC<CompactMacroSummaryProps> = ({
  protein,
  carbs,
  fat,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  // Animation values for segment scale entrance
  const proteinScale = useSharedValue(0);
  const carbsScale = useSharedValue(0);
  const fatScale = useSharedValue(0);

  // Calculate percentages and minimum visible width
  const percentages = useMemo(() => {
    const total = protein + carbs + fat;

    if (total === 0) {
      return { protein: 0, carbs: 0, fat: 0, total: 0 };
    }

    return {
      protein: (protein / total) * 100,
      carbs: (carbs / total) * 100,
      fat: (fat / total) * 100,
      total,
    };
  }, [protein, carbs, fat]);

  // Trigger entrance animations on mount
  useEffect(() => {
    // Staggered entrance animations with spring physics
    proteinScale.value = withDelay(
      50,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
    carbsScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
    fatScale.value = withDelay(
      150,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
  }, [percentages.protein, percentages.carbs, percentages.fat]); // Re-animate when percentages change

  // Determine which segments are visible for border radius logic
  const visibleSegments = useMemo(() => {
    const segments = [];
    if (percentages.protein > 0) segments.push("protein");
    if (percentages.carbs > 0) segments.push("carbs");
    if (percentages.fat > 0) segments.push("fat");
    return segments;
  }, [percentages.protein, percentages.carbs, percentages.fat]);

  const isFirstSegment = (segment: string) => visibleSegments[0] === segment;
  const isLastSegment = (segment: string) =>
    visibleSegments[visibleSegments.length - 1] === segment;

  // Animated styles for each segment
  const proteinSegmentStyle = useAnimatedStyle(() => ({
    flex: percentages.protein,
    transform: [{ scaleX: proteinScale.value }],
  }));

  const carbsSegmentStyle = useAnimatedStyle(() => ({
    flex: percentages.carbs,
    transform: [{ scaleX: carbsScale.value }],
  }));

  const fatSegmentStyle = useAnimatedStyle(() => ({
    flex: percentages.fat,
    transform: [{ scaleX: fatScale.value }],
  }));

  // Don't render if no data
  if (percentages.total === 0) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Macro distribution: ${Math.round(
        percentages.protein
      )}% protein (${protein}g), ${Math.round(
        percentages.carbs
      )}% carbs (${carbs}g), ${Math.round(percentages.fat)}% fat (${fat}g)`}
    >
      {percentages.protein > 0 && (
        <Animated.View
          style={[
            styles.segment,
            styles.proteinSegment,
            proteinSegmentStyle,
            {
              borderTopLeftRadius: isFirstSegment("protein")
                ? theme.spacing.sm
                : 0,
              borderBottomLeftRadius: isFirstSegment("protein")
                ? theme.spacing.sm
                : 0,
              borderTopRightRadius: isLastSegment("protein")
                ? theme.spacing.sm
                : 0,
              borderBottomRightRadius: isLastSegment("protein")
                ? theme.spacing.sm
                : 0,
            },
          ]}
        />
      )}
      {percentages.carbs > 0 && (
        <Animated.View
          style={[
            styles.segment,
            styles.carbsSegment,
            carbsSegmentStyle,
            {
              borderTopLeftRadius: isFirstSegment("carbs")
                ? theme.spacing.sm
                : 0,
              borderBottomLeftRadius: isFirstSegment("carbs")
                ? theme.spacing.sm
                : 0,
              borderTopRightRadius: isLastSegment("carbs")
                ? theme.spacing.sm
                : 0,
              borderBottomRightRadius: isLastSegment("carbs")
                ? theme.spacing.sm
                : 0,
            },
          ]}
        />
      )}
      {percentages.fat > 0 && (
        <Animated.View
          style={[
            styles.segment,
            styles.fatSegment,
            fatSegmentStyle,
            {
              borderTopLeftRadius: isFirstSegment("fat") ? theme.spacing.sm : 0,
              borderBottomLeftRadius: isFirstSegment("fat")
                ? theme.spacing.sm
                : 0,
              borderTopRightRadius: isLastSegment("fat") ? theme.spacing.sm : 0,
              borderBottomRightRadius: isLastSegment("fat")
                ? theme.spacing.sm
                : 0,
            },
          ]}
        />
      )}
    </View>
  );
};

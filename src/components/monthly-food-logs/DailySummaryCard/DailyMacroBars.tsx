import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { AppText } from "@/components";

interface DailyMacroBarsProps {
  caloriesPercent: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

// Internal component: single vertical macro bar with track
const VerticalMacroBar: React.FC<{
  percent: number;
  color: string;
  label: string;
  width: number;
}> = ({ percent, color, label, width }) => {
  const { theme, colorScheme } = useTheme();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, percent)), {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [percent]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${progress.value}%` }));

  // Ensure stable layout regardless of text length (e.g., "128%")
  const labelMinWidth = Math.max(width, 44);

  return (
    <View style={{ alignItems: "center", width: labelMinWidth, flexShrink: 0 }}>
      <View
        style={{
          height: 96,
          width,
          borderRadius: theme.components.buttons.cornerRadius,
          backgroundColor:
            theme.getComponentStyles(colorScheme).progressBars.trackColor,
          overflow: "hidden",
          justifyContent: "flex-end",
        }}
        accessibilityRole="progressbar"
        accessibilityLabel={`${label} progress`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: color,
              width: "100%",
              borderTopLeftRadius: theme.components.buttons.cornerRadius,
              borderTopRightRadius: theme.components.buttons.cornerRadius,
            },
            fillStyle,
          ]}
        />
      </View>
      <AppText
        role="Caption"
        numberOfLines={1}
        ellipsizeMode="clip"
        style={{
          marginTop: theme.spacing.xs,
          width: labelMinWidth,
          textAlign: "center",
        }}
      >
        {`${Math.round(percent)}%`}
      </AppText>
    </View>
  );
};

export const DailyMacroBars: React.FC<DailyMacroBarsProps> = ({
  caloriesPercent,
  proteinPercent,
  carbsPercent,
  fatPercent,
}) => {
  const { colors } = useTheme();

  const barWidths = useMemo(
    () => ({
      calories: 52, // make calories the widest
      others: 28, // other three equal and smaller
    }),
    []
  );

  return (
    <View style={styles.container}>
      <VerticalMacroBar
        percent={caloriesPercent}
        color={colors.semantic?.calories || colors.accent}
        label="Calories"
        width={barWidths.calories}
      />
      <VerticalMacroBar
        percent={proteinPercent}
        color={colors.semantic?.protein || colors.accent}
        label="Protein"
        width={barWidths.others}
      />
      <VerticalMacroBar
        percent={carbsPercent}
        color={colors.semantic?.carbs || colors.accent}
        label="Carbs"
        width={barWidths.others}
      />
      <VerticalMacroBar
        percent={fatPercent}
        color={colors.semantic?.fat || colors.accent}
        label="Fat"
        width={barWidths.others}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 12,
  },
});

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { Flame, Plus, Minus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface CalorieControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const CalorieControl = ({
  value,
  onChange,
  min = 1200,
  max = 4500,
  step = 50,
}: CalorieControlProps) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const handleIncrement = async () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDecrement = async () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSliderChange = (sliderValue: number) => {
    const roundedValue = Math.round(sliderValue / step) * step;
    onChange(roundedValue);
  };

  const handleSliderComplete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      {/* Value Display with Steppers */}
      <View style={styles.displayRow}>
        <Pressable
          onPress={handleDecrement}
          style={styles.stepperButton}
          disabled={value <= min}
          accessibilityLabel="Decrease calories"
        >
          <Minus
            size={24}
            color={value <= min ? colors.secondaryText : colors.accent}
            strokeWidth={2}
          />
        </Pressable>

        <View style={styles.valueContainer}>
          <Flame
            size={28}
            color={colors.semantic.calories}
            fill={colors.semantic.calories}
            strokeWidth={0}
          />
          <AppText role="Title1">{value}</AppText>
          <AppText role="Body" color="secondary">
            kcal
          </AppText>
        </View>

        <Pressable
          onPress={handleIncrement}
          style={styles.stepperButton}
          disabled={value >= max}
          accessibilityLabel="Increase calories"
        >
          <Plus
            size={24}
            color={value >= max ? colors.secondaryText : colors.accent}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.subtleBackground}
          thumbTintColor={colors.accent}
          step={step}
        />
        <View style={styles.sliderLabels}>
          <AppText role="Caption" color="secondary">
            {min}
          </AppText>
          <AppText role="Caption" color="secondary">
            {max}
          </AppText>
        </View>
      </View>

      {/* Helper Text */}
      <View style={styles.helperContainer}>
        <AppText role="Caption" color="secondary" style={styles.helperText}>
          Most athletes consume 2000-3500 kcal/day depending on their goals and
          activity level.
        </AppText>
      </View>
    </View>
  );
};

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      gap: spacing.lg,
    },
    displayRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.lg,
    },
    stepperButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.subtleBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    sliderContainer: {
      gap: spacing.xs,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xs,
    },
    helperContainer: {
      alignItems: "center",
    },
    helperText: {
      textAlign: "center",
      lineHeight: 20,
      maxWidth: "85%",
    },
  });
};

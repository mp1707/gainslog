import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { Plus, Minus } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface MacroSliderProps {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  grams: number;
  onChange: (grams: number) => void;
  maxCalories: number;
  caloriesPerGram: number;
  step?: number;
  isAnySliderDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const MacroSlider = ({
  label,
  icon: Icon,
  iconColor,
  grams,
  onChange,
  maxCalories,
  caloriesPerGram,
  step = 5,
  isAnySliderDragging = false,
  onDragStart,
  onDragEnd,
}: MacroSliderProps) => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);

  const maxGrams = Math.floor(maxCalories / caloriesPerGram);
  const calories = grams * caloriesPerGram;

  // Track slider key to force re-mount when needed (but not during any drag)
  const [sliderKey, setSliderKey] = useState(0);
  const prevMaxGrams = useRef(maxGrams);

  // Force remount on initial render to fix React Native Slider position bug
  useEffect(() => {
    setSliderKey(1);
  }, []);

  // Update slider key when maxGrams changes, but only when no slider is dragging
  useEffect(() => {
    if (!isAnySliderDragging && prevMaxGrams.current !== maxGrams) {
      setSliderKey((k) => k + 1);
    }
    prevMaxGrams.current = maxGrams;
  }, [maxGrams, isAnySliderDragging]);

  // Calculate percentage based on total budget (passed as maxCalories for protein,
  // or remaining for fat) but show it relative to the original total
  const percentage = maxCalories > 0 ? Math.round((calories / maxCalories) * 100) : 0;

  // Helper to clamp grams value to ensure we never exceed calorie budget
  const clampGrams = (value: number): number => {
    // Ensure value is within 0 to maxGrams
    const clamped = Math.max(0, Math.min(value, maxGrams));

    // Additional safety: ensure the calories don't exceed maxCalories
    if (clamped * caloriesPerGram > maxCalories) {
      return Math.floor(maxCalories / caloriesPerGram);
    }

    return clamped;
  };

  const handleIncrement = async () => {
    const newValue = clampGrams(grams + step);
    onChange(newValue);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDecrement = async () => {
    const newValue = clampGrams(grams - step);
    onChange(newValue);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSliderChange = (value: number) => {
    const roundedValue = Math.round(value / step) * step;
    const clampedValue = clampGrams(roundedValue);
    onChange(clampedValue);
  };

  const handleSliderStart = () => {
    onDragStart?.();
  };

  const handleSliderComplete = async () => {
    onDragEnd?.();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      {/* Header with Icon and Label */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Icon size={20} color={iconColor} fill={iconColor} strokeWidth={0} />
          <AppText role="Body">{label}</AppText>
        </View>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={handleDecrement}
            style={styles.stepperButton}
            disabled={grams <= 0}
            accessibilityLabel={`Decrease ${label}`}
          >
            <Minus
              size={18}
              color={grams <= 0 ? colors.secondaryText : iconColor}
              strokeWidth={2}
            />
          </Pressable>
          <Pressable
            onPress={handleIncrement}
            style={styles.stepperButton}
            disabled={grams >= maxGrams}
            accessibilityLabel={`Increase ${label}`}
          >
            <Plus
              size={18}
              color={grams >= maxGrams ? colors.secondaryText : iconColor}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>

      {/* Value Display */}
      <View style={styles.valueRow}>
        <AppText role="Title2">{grams} g</AppText>
        <AppText role="Caption" color="secondary">
          {calories} kcal / {percentage}%
        </AppText>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          key={sliderKey}
          style={styles.slider}
          minimumValue={0}
          maximumValue={maxGrams}
          value={grams}
          onValueChange={handleSliderChange}
          onSlidingStart={handleSliderStart}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={iconColor}
          maximumTrackTintColor={colors.subtleBackground}
          thumbTintColor={iconColor}
          step={step}
        />
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
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.subtleBackground,
      borderRadius: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    stepperRow: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    stepperButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
    },
    sliderContainer: {
      //
    },
    slider: {
      width: "100%",
      height: 32,
    },
  });
};

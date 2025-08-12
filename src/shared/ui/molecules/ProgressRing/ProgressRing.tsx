import React from "react";
import { View } from "react-native";
import { RadialProgressBar } from "@/shared/ui/atoms";
import { useTheme } from "@/providers/ThemeProvider";

type NutritionType = "calories" | "protein" | "carbs" | "fat";

interface ProgressRingProps {
  current: number;
  target: number;
  unit: string;
  label: string;
  size?: number;
  color?: string;
  nutritionType?: NutritionType;
  strokeWidth?: number;
}

export function ProgressRing({
  current,
  target,
  unit,
  label,
  size = 100,
  color,
  nutritionType,
  strokeWidth,
}: ProgressRingProps) {
  const { colors } = useTheme();

  const effectiveColor =
    color ?? (nutritionType ? colors.semantic[nutritionType] : colors.accent);

  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}: ${percentage}%`}
    >
      <RadialProgressBar
        current={current}
        target={target}
        unit={unit}
        label={label}
        size={size}
        color={effectiveColor}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

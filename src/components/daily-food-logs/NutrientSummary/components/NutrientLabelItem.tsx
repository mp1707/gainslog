import React from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { NutrientLabel } from "./NutrientLabel";

interface NutrientLabelItemProps {
  Icon: LucideIcon;
  iconScale?: SharedValue<number>;
  iconColor: string;
  iconFill?: string;
  iconStrokeWidth?: number;
  label: string;
  currentValue: number | string;
  targetValue?: number | string | null;
  unit?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pressable wrapper around the shared nutrient label component.
 */
export const NutrientLabelItem: React.FC<NutrientLabelItemProps> = ({
  Icon,
  iconScale,
  iconColor,
  iconFill,
  iconStrokeWidth,
  label,
  currentValue,
  targetValue,
  unit,
  onPress,
  style,
}) => {
  const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={pressAnimatedStyle}>
        <NutrientLabel
          Icon={Icon}
          iconScale={iconScale}
          iconColor={iconColor}
          iconFill={iconFill}
          iconStrokeWidth={iconStrokeWidth}
          label={label}
          currentValue={currentValue}
          targetValue={targetValue}
          unit={unit}
          style={style}
        />
      </Animated.View>
    </Pressable>
  );
};

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  AccessibilityActionEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomNumericKeypad } from "@/shared/ui/molecules/CustomNumericKeypad";
import { createStyles } from "./Stepper.styles";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  type?: "calories" | "protein" | "carbs" | "fat" | "default";
  disabled?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 0,
  max = 10000,
  step = 1,
  onChange,
  type = "default",
  disabled = false,
}) => {
  const [isKeypadVisible, setIsKeypadVisible] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation values
  const minusScale = useSharedValue(1);
  const plusScale = useSharedValue(1);
  const valueScale = useSharedValue(1);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const handleMinus = () => {
    if (disabled) return;
    const newValue = clamp(value - step);
    if (newValue !== value) {
      // Animate value change
      valueScale.value = withSpring(
        1.1,
        { damping: 15, stiffness: 300 },
        () => {
          valueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }
      );
      onChange(newValue);
    }
  };

  const handlePlus = () => {
    if (disabled) return;
    const newValue = clamp(value + step);
    if (newValue !== value) {
      // Animate value change
      valueScale.value = withSpring(
        1.1,
        { damping: 15, stiffness: 300 },
        () => {
          valueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }
      );
      onChange(newValue);
    }
  };

  const handleMinusPressIn = () => {
    if (disabled) return;
    minusScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handleMinusPressOut = () => {
    if (disabled) return;
    minusScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePlusPressIn = () => {
    if (disabled) return;
    plusScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePlusPressOut = () => {
    if (disabled) return;
    plusScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleKeypadSubmit = (newValue: number) => {
    onChange(clamp(newValue));
    setIsKeypadVisible(false);
  };

  const handleKeypadClose = () => {
    setIsKeypadVisible(false);
  };

  const handleValueTap = () => {
    if (!disabled) {
      setIsKeypadVisible(true);
    }
  };

  // Accessibility action handler for increment/decrement
  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    switch (event.nativeEvent.actionName) {
      case "increment":
        handlePlus();
        break;
      case "decrement":
        handleMinus();
        break;
    }
  };

  const accentColor =
    type === "calories"
      ? colors.semantic.calories
      : type === "protein"
      ? colors.semantic.protein
      : type === "carbs"
      ? colors.semantic.carbs
      : type === "fat"
      ? colors.semantic.fat
      : colors.accent;

  // Get disabled styling
  const disabledStyle = disabled ? { opacity: 0.4 } : {};

  // Animated styles
  const minusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }));

  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const valueAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: valueScale.value }],
  }));

  return (
    <>
      <View
        style={[styles.container, { borderColor: accentColor }, disabledStyle]}
        accessibilityRole="adjustable"
        accessibilityLabel={`${
          type === "default" ? "Value" : type
        } stepper. Current value is ${value}`}
        accessibilityValue={{
          min: min,
          max: max,
          now: value,
          text: `${value}`,
        }}
        accessibilityActions={[
          { name: "increment", label: `Increase by ${step}` },
          { name: "decrement", label: `Decrease by ${step}` },
        ]}
        onAccessibilityAction={onAccessibilityAction}
      >
        <Animated.View style={minusAnimatedStyle}>
          <TouchableOpacity
            style={[styles.buttonBase, styles.buttonLeft]}
            onPress={handleMinus}
            onPressIn={handleMinusPressIn}
            onPressOut={handleMinusPressOut}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Decrease value by ${step}`}
            accessibilityHint="Double tap to decrease the value"
          >
            <Text style={[styles.buttonText, { color: accentColor }]}>−</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={valueAnimatedStyle}>
          <TouchableOpacity
            style={styles.valueBox}
            onPress={handleValueTap}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Current value: ${value}. Tap to edit directly.`}
            accessibilityHint="Opens numeric keypad to enter a specific value"
          >
            <Text
              style={styles.valueText}
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Current value: ${value}`}
            >
              {value}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={plusAnimatedStyle}>
          <TouchableOpacity
            style={[styles.buttonBase, styles.buttonRight]}
            onPress={handlePlus}
            onPressIn={handlePlusPressIn}
            onPressOut={handlePlusPressOut}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Increase value by ${step}`}
            accessibilityHint="Double tap to increase the value"
          >
            <Text style={[styles.buttonText, { color: accentColor }]}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <CustomNumericKeypad
        visible={isKeypadVisible}
        initialValue={value}
        min={min}
        max={max}
        onSubmit={handleKeypadSubmit}
        onClose={handleKeypadClose}
      />
    </>
  );
};

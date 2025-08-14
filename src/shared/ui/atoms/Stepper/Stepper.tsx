import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  AccessibilityActionEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
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
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Update inputValue when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(value));
    }
  }, [value, isFocused]);

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

  const handleInputChange = (text: string) => {
    // Allow empty string, numbers, and single decimal point
    if (text === "" || /^\d*\.?\d*$/.test(text)) {
      setInputValue(text);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || inputValue === "") {
      // Reset to current value if invalid
      setInputValue(String(value));
    } else {
      const clampedValue = clamp(numValue);
      setInputValue(String(clampedValue));
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleSubmitEditing = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && inputValue !== "") {
      const clampedValue = clamp(numValue);
      setInputValue(String(clampedValue));
      if (clampedValue !== value) {
        onChange(clampedValue);
      }
    }
    setIsFocused(false);
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
        <View style={styles.valueBox}>
          <TextInput
            style={styles.valueText}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onSubmitEditing={handleSubmitEditing}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            editable={!disabled}
            textAlign="center"
            accessibilityRole="spinbutton"
            accessibilityLabel={`Current value: ${value}. Tap to edit directly.`}
            accessibilityValue={{
              min: min,
              max: max,
              now: value,
              text: String(value),
            }}
            accessibilityHint="Double tap to edit with keyboard"
          />
        </View>
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
  );
};

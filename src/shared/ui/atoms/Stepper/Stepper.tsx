import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from "react-native-reanimated";
import { useTheme } from "../../../../providers/ThemeProvider";
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
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation values
  const minusScale = useSharedValue(1);
  const plusScale = useSharedValue(1);
  const valueScale = useSharedValue(1);

  // Sync internal input state when external value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(value));
    }
  }, [value, isEditing]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const handleMinus = () => {
    if (disabled) return;
    const newValue = clamp(value - step);
    if (newValue !== value) {
      // Animate value change
      valueScale.value = withSpring(1.1, { damping: 15, stiffness: 300 }, () => {
        valueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
      onChange(newValue);
    }
  };

  const handlePlus = () => {
    if (disabled) return;
    const newValue = clamp(value + step);
    if (newValue !== value) {
      // Animate value change
      valueScale.value = withSpring(1.1, { damping: 15, stiffness: 300 }, () => {
        valueScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      });
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

  const confirmInput = () => {
    const numeric = parseInt(inputValue, 10);
    if (!isNaN(numeric)) {
      onChange(clamp(numeric));
    }
    setIsEditing(false);
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
      : colors.accent

  // Get disabled styling
  const disabledStyle = disabled ? { opacity: 0.4 } : {}

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
    <View style={[styles.container, { borderColor: accentColor }, disabledStyle]}>
      <Animated.View style={minusAnimatedStyle}>
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonLeft]}
          onPress={handleMinus}
          onPressIn={handleMinusPressIn}
          onPressOut={handleMinusPressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Decrease value by ${step}. Current value is ${value}`}
          accessibilityHint="Double tap to decrease the value"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>−</Text>
        </TouchableOpacity>
      </Animated.View>

      {isEditing ? (
        <TextInput
          ref={inputRef}
          style={[styles.valueBox, styles.valueInput]}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="number-pad"
          returnKeyType="done"
          onBlur={confirmInput}
          onSubmitEditing={confirmInput}
          autoFocus
          accessibilityLabel={`Enter value between ${min} and ${max}`}
          accessibilityHint={`Current value is ${inputValue}. Enter a number and press done to confirm`}
          accessibilityRole="spinbutton"
        />
      ) : (
        <Animated.View style={valueAnimatedStyle}>
          <TouchableOpacity
            style={styles.valueBox}
            onPress={() => !disabled && setIsEditing(true)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Current value is ${value}. Tap to edit`}
            accessibilityHint="Opens text input to enter a specific value"
          >
            <Text style={styles.valueText}>{value}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View style={plusAnimatedStyle}>
        <TouchableOpacity
          style={[styles.buttonBase, styles.buttonRight]}
          onPress={handlePlus}
          onPressIn={handlePlusPressIn}
          onPressOut={handlePlusPressOut}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Increase value by ${step}. Current value is ${value}`}
          accessibilityHint="Double tap to increase the value"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

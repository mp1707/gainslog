import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { useTheme } from "../../../../providers/ThemeProvider";
import { createStyles } from "./Stepper.styles";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 0,
  max = 10000,
  step = 1,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [minusPressed, setMinusPressed] = useState(false);
  const [plusPressed, setPlusPressed] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Sync internal input state when external value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(value));
    }
  }, [value, isEditing]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const handleMinus = () => {
    onChange(clamp(value - step));
  };

  const handlePlus = () => {
    onChange(clamp(value + step));
  };

  const confirmInput = () => {
    const numeric = parseInt(inputValue, 10);
    if (!isNaN(numeric)) {
      onChange(clamp(numeric));
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.buttonBase, 
          styles.buttonLeft,
          minusPressed && styles.buttonBasePressed
        ]}
        onPress={handleMinus}
        onPressIn={() => setMinusPressed(true)}
        onPressOut={() => setMinusPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={`Decrease value by ${step}. Current value is ${value}`}
        accessibilityHint="Double tap to decrease the value"
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

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
        <TouchableOpacity
          style={styles.valueBox}
          onPress={() => setIsEditing(true)}
          accessibilityRole="button"
          accessibilityLabel={`Current value is ${value}. Tap to edit`}
          accessibilityHint="Opens text input to enter a specific value"
        >
          <Text style={styles.valueText}>{value}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.buttonBase, 
          styles.buttonRight,
          plusPressed && styles.buttonBasePressed
        ]}
        onPress={handlePlus}
        onPressIn={() => setPlusPressed(true)}
        onPressOut={() => setPlusPressed(false)}
        accessibilityRole="button"
        accessibilityLabel={`Increase value by ${step}. Current value is ${value}`}
        accessibilityHint="Double tap to increase the value"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

import React, { useState, forwardRef } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import { CustomNumericKeypad } from "../../molecules/CustomNumericKeypad";
import { useTheme } from "../../../../providers/ThemeProvider";
import { createStyles } from "./NumericTextInput.styles";

interface NumericTextInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: any;
}

export const NumericTextInput = forwardRef<RNTextInput, NumericTextInputProps>(
  (
    {
      value,
      onChangeText,
      placeholder = "0",
      disabled = false,
      min = 0,
      max = 10000,
      accessibilityLabel,
      accessibilityHint,
      style,
    },
    ref
  ) => {
    const [isKeypadVisible, setIsKeypadVisible] = useState(false);
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const handlePress = () => {
      if (!disabled) {
        setIsKeypadVisible(true);
      }
    };

    const handleKeypadSubmit = (newValue: number) => {
      onChangeText(String(newValue));
      setIsKeypadVisible(false);
    };

    const handleKeypadClose = () => {
      setIsKeypadVisible(false);
    };

    // Convert string value to number for keypad, default to 0 if empty or invalid
    const numericValue =
      value === "" || value === "0" ? 0 : parseFloat(value) || 0;

    const containerStyle = [
      styles.container,
      disabled && styles.disabled,
      style,
    ];

    return (
      <>
        <TouchableOpacity
          style={containerStyle}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || `${placeholder} input`}
          accessibilityHint={
            accessibilityHint || "Tap to enter a numeric value"
          }
          accessibilityState={{ disabled }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.text,
              value === "" ? styles.placeholder : styles.value,
              disabled && styles.disabledText,
            ]}
          >
            {value || placeholder}
          </Text>
        </TouchableOpacity>

        <CustomNumericKeypad
          visible={isKeypadVisible}
          initialValue={numericValue}
          min={min}
          max={max}
          onSubmit={handleKeypadSubmit}
          onClose={handleKeypadClose}
        />
      </>
    );
  }
);

NumericTextInput.displayName = "NumericTextInput";

import React, { useState, useEffect, forwardRef } from "react";
import { View, Text } from "react-native";
import { TextInput as RNTextInput } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
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
  inputAccessoryViewID?: string;
  large?: boolean;
  extraLarge?: boolean;
  borderless?: boolean;
  integerOnly?: boolean;
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
      inputAccessoryViewID,
      large = false,
      extraLarge = false,
      borderless = false,
      integerOnly = false,
    },
    ref
  ) => {
    const { colorScheme } = useTheme();
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const { colors } = useTheme();
    const styles = createStyles(colors, { large, extraLarge, borderless });

    // Update inputValue when value prop changes
    useEffect(() => {
      if (!isFocused) {
        setInputValue(value);
      }
    }, [value, isFocused]);

    const clamp = (val: number) => Math.max(min, Math.min(max, val));

    const handleInputChange = (text: string) => {
      // Allow empty string and numbers based on integerOnly setting
      const regex = integerOnly ? /^\d*$/ : /^\d*\.?\d*$/;
      if (text === '' || regex.test(text)) {
        setInputValue(text);
      }
    };

    const handleInputBlur = () => {
      setIsFocused(false);
      if (inputValue === '') {
        // Keep empty if user wants it empty (for AI estimation)
        onChangeText('');
      } else {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
          // Reset to original value if invalid
          setInputValue(value);
        } else {
          const clampedValue = clamp(numValue);
          const clampedString = integerOnly ? String(Math.floor(clampedValue)) : String(clampedValue);
          setInputValue(clampedString);
          if (clampedString !== value) {
            onChangeText(clampedString);
          }
        }
      }
    };

    const handleInputFocus = () => {
      if (!disabled) {
        setIsFocused(true);
      }
    };

    const handleSubmitEditing = () => {
      if (inputValue === '') {
        onChangeText('');
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          const clampedValue = clamp(numValue);
          const clampedString = integerOnly ? String(Math.floor(clampedValue)) : String(clampedValue);
          setInputValue(clampedString);
          if (clampedString !== value) {
            onChangeText(clampedString);
          }
        }
      }
      setIsFocused(false);
    };

    const containerStyle = [
      styles.container,
      disabled && styles.disabled,
      style,
    ];

    return (
      <View style={containerStyle}>
        <RNTextInput
          ref={ref}
          style={[
            styles.text,
            inputValue === '' ? styles.placeholder : styles.value,
            disabled && styles.disabledText,
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onSubmitEditing={handleSubmitEditing}
          keyboardType="decimal-pad"
          keyboardAppearance={colorScheme}
          selectTextOnFocus
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          inputAccessoryViewID={inputAccessoryViewID}
          accessibilityRole="spinbutton"
          accessibilityLabel={accessibilityLabel || `${placeholder} input`}
          accessibilityHint={accessibilityHint || "Enter a numeric value"}
          accessibilityValue={{
            min: min,
            max: max,
            now: parseFloat(value) || 0,
            text: value || placeholder,
          }}
        />
      </View>
    );
  }
);

NumericTextInput.displayName = "NumericTextInput";

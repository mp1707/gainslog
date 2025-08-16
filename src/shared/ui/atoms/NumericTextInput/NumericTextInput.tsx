import React, { useState, useEffect, forwardRef, useCallback, useMemo } from "react";
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
  autoFocus?: boolean;
}

export const NumericTextInput = React.memo(forwardRef<RNTextInput, NumericTextInputProps>(
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
      autoFocus = false,
    },
    ref
  ) => {
    const { colorScheme, colors } = useTheme();
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    
    // Memoize styles to prevent recreation on every render
    const styles = useMemo(
      () => createStyles(colors, { large, extraLarge, borderless }),
      [colors, large, extraLarge, borderless]
    );

    // Update inputValue when value prop changes (prevent infinite loops)
    useEffect(() => {
      if (!isFocused && value !== inputValue) {
        setInputValue(value);
      }
    }, [value, isFocused, inputValue]);

    // Memoize clamp function to prevent recreation
    const clamp = useCallback((val: number) => Math.max(min, Math.min(max, val)), [min, max]);

    // Memoize regex to prevent recreation
    const validationRegex = useMemo(
      () => integerOnly ? /^\d*$/ : /^\d*\.?\d*$/,
      [integerOnly]
    );

    const handleInputChange = useCallback((text: string) => {
      // Allow empty string and numbers based on integerOnly setting
      if (text === '' || validationRegex.test(text)) {
        setInputValue(text);
        // Call parent's onChangeText immediately during typing
        onChangeText(text);
      }
    }, [validationRegex, onChangeText]);

    const handleInputBlur = useCallback(() => {
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
    }, [inputValue, value, clamp, integerOnly, onChangeText]);

    const handleInputFocus = useCallback(() => {
      if (!disabled) {
        setIsFocused(true);
      }
    }, [disabled]);

    const handleSubmitEditing = useCallback(() => {
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
    }, [inputValue, clamp, integerOnly, value, onChangeText]);

    // Memoize style arrays to prevent recreation
    const containerStyle = useMemo(() => [
      styles.container,
      disabled && styles.disabled,
      style,
    ], [styles, disabled, style]);

    const textInputStyle = useMemo(() => [
      styles.text,
      inputValue === '' ? styles.placeholder : styles.value,
      disabled && styles.disabledText,
    ], [styles, inputValue, disabled]);

    // Memoize accessibility value to prevent recreation
    const accessibilityValue = useMemo(() => ({
      min: min,
      max: max,
      now: parseFloat(value) || 0,
      text: value || placeholder,
    }), [min, max, value, placeholder]);

    return (
      <View style={containerStyle}>
        <RNTextInput
          ref={ref}
          style={textInputStyle}
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
          accessibilityValue={accessibilityValue}
          autoFocus={autoFocus}
        />
      </View>
    );
  }
));

NumericTextInput.displayName = "NumericTextInput";

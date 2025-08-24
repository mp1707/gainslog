import React, { useState, forwardRef } from "react";
import { TextInput as RNTextInput, ViewStyle } from "react-native";
import { TextInputProps } from "@/types/indexLegacy";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./TextInput.styles";

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      multiline = false,
      keyboardType = "default",
      autoCapitalize = "sentences",
      autoFocus = false,
      error = false,
      disabled = false,
      style,
      accessibilityLabel,
      accessibilityHint,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const { colors, colorScheme } = useTheme();
    const styles = createStyles(colors);

    // Get base styles
    const baseStyles: ViewStyle[] = [styles.base];

    // Add multiline styles
    if (multiline) {
      baseStyles.push(styles.multiline);
    }

    // Add focus styles
    if (isFocused && !disabled) {
      baseStyles.push(styles.focused);
    }

    // Add error styles
    if (error && !disabled) {
      baseStyles.push(styles.error);
    }

    // Add disabled styles
    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    // Add custom styles
    if (style) {
      baseStyles.push(style as ViewStyle);
    }

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <RNTextInput
        ref={ref}
        style={baseStyles}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        keyboardAppearance={colorScheme}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        textAlignVertical={multiline ? "top" : "center"}
        numberOfLines={multiline ? 4 : 1}
        editable={!disabled}
        selectTextOnFocus={!disabled}
        returnKeyType={multiline ? "default" : "done"}
        blurOnSubmit={!multiline}
        // Accessibility
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled,
          selected: isFocused,
          expanded: multiline,
        }}
        accessible={true}
      />
    );
  }
);

TextInput.displayName = "TextInput";

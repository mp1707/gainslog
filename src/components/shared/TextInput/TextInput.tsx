import React, { useState, forwardRef, useMemo, useCallback } from "react";
import { TextInput as RNTextInput, ViewStyle } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/theme";
import { createStyles } from "./TextInput.styles";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "number-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  inputAccessoryViewID?: string;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

const TextInputComponent = forwardRef<RNTextInput, TextInputProps>(
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
      inputAccessoryViewID,
      style,
      accessibilityLabel,
      accessibilityHint,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    // React state for component logic (accessibility, conditional rendering)
    const [isFocused, setIsFocused] = useState(false);
    // SharedValue for smooth animations on native thread
    const isFocusedAnimated = useSharedValue(false);
    const { colors, colorScheme } = useTheme();

    // Memoize styles to prevent recalculation on every render
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Create animated style for focus state that runs on native thread
    const animatedBorderStyle = useAnimatedStyle(() => {
      return {
        borderColor: withTiming(
          isFocusedAnimated.value ? colors.accent : colors.border,
          { duration: 200 }
        ),
        borderWidth: withTiming(isFocusedAnimated.value ? 2 : 1, {
          duration: 200,
        }),
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: withTiming(isFocusedAnimated.value ? 1 : 0, {
          duration: 200,
        }),
        shadowRadius: withTiming(isFocusedAnimated.value ? 4 : 0, {
          duration: 200,
        }),
        elevation: withTiming(isFocusedAnimated.value ? 2 : 0, {
          duration: 200,
        }),
      };
    });

    // Memoized event handlers - update both React state and SharedValue
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true); // React state for component logic
        isFocusedAnimated.value = true; // SharedValue for smooth animations
        onFocus?.(e);
      },
      [onFocus, isFocusedAnimated]
    );

    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false); // React state for component logic
        isFocusedAnimated.value = false; // SharedValue for smooth animations
        onBlur?.(e);
      },
      [onBlur, isFocusedAnimated]
    );

    // Memoize computed styles - focus styling now handled by animatedBorderStyle
    const computedStyles = useMemo(() => {
      const baseStyles: ViewStyle[] = [styles.base];

      if (multiline) {
        baseStyles.push(styles.multiline);
      }

      if (error && !disabled) {
        baseStyles.push(styles.error);
      }

      if (disabled) {
        baseStyles.push(styles.disabled);
      }

      // Add the animated border style that runs on native thread
      baseStyles.push(animatedBorderStyle);

      if (style) {
        baseStyles.push(style as ViewStyle);
      }

      return baseStyles;
    }, [styles, multiline, disabled, error, style, animatedBorderStyle]);

    // Determine if we should use multiline behavior
    const shouldUseMultiline = multiline;

    return (
      <RNTextInput
        ref={ref}
        style={computedStyles}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        keyboardAppearance={colorScheme}
        multiline={shouldUseMultiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        textAlignVertical={shouldUseMultiline ? "top" : "center"}
        numberOfLines={shouldUseMultiline ? 4 : 1}
        editable={!disabled}
        selectTextOnFocus={!disabled}
        returnKeyType={shouldUseMultiline ? "default" : "done"}
        blurOnSubmit={!shouldUseMultiline}
        inputAccessoryViewID={inputAccessoryViewID}
        // Accessibility
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled,
          selected: isFocused,
          expanded: shouldUseMultiline,
        }}
        accessible={true}
      />
    );
  }
);

// Memoize the component to prevent unnecessary re-renders
export const TextInput = React.memo(TextInputComponent);

TextInput.displayName = "TextInput";

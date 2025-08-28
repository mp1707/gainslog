import React, { useState, forwardRef } from "react";
import { TextInput as RNTextInput, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Create animated TextInput component
const AnimatedTextInput = Animated.createAnimatedComponent(RNTextInput);
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
  autoExpand?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

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
      autoExpand = false,
      style,
      accessibilityLabel,
      accessibilityHint,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { colors, colorScheme } = useTheme();
    const styles = createStyles(colors);

    // Animation values for autoExpand feature
    const heightAnimation = useSharedValue(44); // Start with single-line height

    // Animated style for height transitions
    const animatedHeightStyle = useAnimatedStyle(() => {
      return {
        height: heightAnimation.value,
      };
    }, []);

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
      
      // Handle autoExpand animation
      if (autoExpand && !multiline) {
        setIsExpanded(true);
        heightAnimation.value = withTiming(100, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }
      
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      
      // Handle autoExpand animation
      if (autoExpand && !multiline) {
        setIsExpanded(false);
        heightAnimation.value = withTiming(44, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }
      
      onBlur?.(e);
    };

    // Determine if we should use multiline behavior (original multiline prop or expanded state)
    const shouldUseMultiline = multiline || (autoExpand && isExpanded);
    
    return (
      <AnimatedTextInput
        ref={ref}
        style={[baseStyles, autoExpand && !multiline && animatedHeightStyle]}
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

TextInput.displayName = "TextInput";

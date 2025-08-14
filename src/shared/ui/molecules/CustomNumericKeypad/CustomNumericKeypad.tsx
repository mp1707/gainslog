import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { BackspaceIcon } from "phosphor-react-native";
import { BaseModal } from "@/shared/ui/organisms/BaseModal";
import { createStyles } from "./CustomNumericKeypad.styles";
import * as Haptics from "expo-haptics";

interface CustomNumericKeypadProps {
  visible: boolean;
  initialValue: number;
  onSubmit: (value: number) => void;
  onClose: () => void;
  min?: number;
  max?: number;
}

export const CustomNumericKeypad: React.FC<CustomNumericKeypadProps> = ({
  visible,
  initialValue,
  onSubmit,
  onClose,
  min = 0,
  max = 10000,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [displayValue, setDisplayValue] = useState(String(initialValue));
  const [hasDecimal, setHasDecimal] = useState(false);

  // Simplified animation system - single shared value for active button
  const activeButtonId = useSharedValue<string | null>(null);
  const buttonScale = useSharedValue(1);

  // Optimized spring configuration for snappy, smooth animations
  const springConfig = { damping: 20, stiffness: 300, mass: 0.8 };

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      const initialStr = String(initialValue);
      setDisplayValue(initialStr);
      setHasDecimal(initialStr.includes("."));
    }
  }, [visible, initialValue]);

  // Simplified animation function
  const animateButtonPress = useCallback((buttonId: string) => {
    activeButtonId.value = buttonId;
    buttonScale.value = withSpring(0.92, springConfig, () => {
      buttonScale.value = withSpring(1, springConfig, () => {
        activeButtonId.value = null;
      });
    });
  }, [activeButtonId, buttonScale, springConfig]);

  // Single animated style function that applies to any button
  const createButtonAnimatedStyle = useCallback((buttonId: string) => {
    return useAnimatedStyle(() => ({
      transform: [{ 
        scale: activeButtonId.value === buttonId ? buttonScale.value : 1 
      }],
    }));
  }, [activeButtonId, buttonScale]);

  const handleNumberPress = (digit: string) => {
    animateButtonPress(`digit-${digit}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (displayValue === "0" && digit !== ".") {
      setDisplayValue(digit);
    } else if (displayValue.length < 6) {
      // Limit to reasonable length
      setDisplayValue((prev) => prev + digit);
    }
  };

  const handleDecimalPress = () => {
    animateButtonPress("decimal");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!hasDecimal && displayValue.length < 5) {
      setDisplayValue((prev) => prev + ".");
      setHasDecimal(true);
    }
  };

  const handleBackspace = () => {
    animateButtonPress("backspace");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (displayValue.length === 1) {
      setDisplayValue("0");
      setHasDecimal(false);
    } else {
      const newValue = displayValue.slice(0, -1);
      setDisplayValue(newValue);
      setHasDecimal(newValue.includes("."));
    }
  };

  const handleSubmit = () => {
    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onSubmit(numValue);
    }
  };

  const isValidValue = () => {
    const numValue = parseFloat(displayValue);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
  };

  // Digit button component with optimized animation
  const DigitButton: React.FC<{
    digit: string;
    accessibilityLabel: string;
  }> = ({ digit, accessibilityLabel }) => {
    const buttonId = `digit-${digit}`;
    const animatedStyle = createButtonAnimatedStyle(buttonId);
    
    return (
      <Animated.View style={[styles.digitButtonContainer, animatedStyle]}>
        <TouchableOpacity
          style={styles.digitButton}
          onPress={() => handleNumberPress(digit)}
          accessibilityRole="keyboardkey"
          accessibilityLabel={accessibilityLabel}
          activeOpacity={1} // Let our animation handle the visual feedback
        >
          <Text style={styles.digitText}>{digit}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.keypadContainer}>
        {/* Display */}
        <View style={styles.displayContainer}>
          <Text
            style={styles.displayText}
            accessibilityRole="text"
            accessibilityLabel={`Current value: ${displayValue}`}
            accessibilityLiveRegion="polite"
          >
            {displayValue}
          </Text>
          <Text style={styles.rangeText}>
            {min} - {max}
          </Text>
        </View>

        {/* Keypad Grid */}
        <View style={styles.keypadGrid}>
          {/* Row 1: 1, 2, 3 */}
          <View style={styles.keypadRow}>
            <DigitButton digit="1" accessibilityLabel="1" />
            <DigitButton digit="2" accessibilityLabel="2" />
            <DigitButton digit="3" accessibilityLabel="3" />
          </View>

          {/* Row 2: 4, 5, 6 */}
          <View style={styles.keypadRow}>
            <DigitButton digit="4" accessibilityLabel="4" />
            <DigitButton digit="5" accessibilityLabel="5" />
            <DigitButton digit="6" accessibilityLabel="6" />
          </View>

          {/* Row 3: 7, 8, 9 */}
          <View style={styles.keypadRow}>
            <DigitButton digit="7" accessibilityLabel="7" />
            <DigitButton digit="8" accessibilityLabel="8" />
            <DigitButton digit="9" accessibilityLabel="9" />
          </View>

          {/* Row 4: decimal, 0, backspace */}
          <View style={styles.keypadRow}>
            <Animated.View
              style={[
                styles.digitButtonContainer,
                createButtonAnimatedStyle("decimal"),
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.digitButton,
                  !hasDecimal ? {} : styles.disabledButton,
                ]}
                onPress={handleDecimalPress}
                disabled={hasDecimal}
                accessibilityRole="keyboardkey"
                accessibilityLabel="decimal point"
                accessibilityState={{ disabled: hasDecimal }}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.digitText,
                    hasDecimal ? styles.disabledText : {},
                  ]}
                >
                  .
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <DigitButton digit="0" accessibilityLabel="0" />

            <Animated.View
              style={[
                styles.digitButtonContainer,
                createButtonAnimatedStyle("backspace"),
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBackspace}
                accessibilityRole="keyboardkey"
                accessibilityLabel="delete last digit"
                activeOpacity={1}
              >
                <BackspaceIcon
                  size={24}
                  color={colors.accent}
                  weight="regular"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !isValidValue() ? styles.submitButtonDisabled : {},
            ]}
            onPress={handleSubmit}
            disabled={!isValidValue()}
            accessibilityRole="button"
            accessibilityLabel="confirm value"
            accessibilityState={{ disabled: !isValidValue() }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.submitButtonText,
                !isValidValue() ? styles.submitButtonTextDisabled : {},
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
};

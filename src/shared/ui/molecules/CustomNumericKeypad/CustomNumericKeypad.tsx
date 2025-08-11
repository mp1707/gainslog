import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BackspaceIcon } from "phosphor-react-native";
import { useTheme } from "../../../../providers/ThemeProvider";
import { createStyles } from "./CustomNumericKeypad.styles";

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

  // Animation values - always initialize these hooks
  const backdropOpacity = useSharedValue(0);
  const keypadTranslateY = useSharedValue(300);

  // Button press animations - declare all shared values at top level
  const buttonScale0 = useSharedValue(1);
  const buttonScale1 = useSharedValue(1);
  const buttonScale2 = useSharedValue(1);
  const buttonScale3 = useSharedValue(1);
  const buttonScale4 = useSharedValue(1);
  const buttonScale5 = useSharedValue(1);
  const buttonScale6 = useSharedValue(1);
  const buttonScale7 = useSharedValue(1);
  const buttonScale8 = useSharedValue(1);
  const buttonScale9 = useSharedValue(1);
  const buttonScale10 = useSharedValue(1);
  const buttonScale11 = useSharedValue(1);

  // Create array reference after all shared values are declared
  const buttonScales = [
    buttonScale0,
    buttonScale1,
    buttonScale2,
    buttonScale3,
    buttonScale4,
    buttonScale5,
    buttonScale6,
    buttonScale7,
    buttonScale8,
    buttonScale9,
    buttonScale10,
    buttonScale11,
  ];

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      const initialStr = String(initialValue);
      setDisplayValue(initialStr);
      setHasDecimal(initialStr.includes("."));

      // Animate in
      backdropOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      keypadTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    } else {
      // Animate out
      backdropOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
      keypadTranslateY.value = withTiming(300, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible]);

  // Always create animated styles - moved outside of conditional logic
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedKeypadStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keypadTranslateY.value }],
  }));

  // Create individual button animated styles to follow Rules of Hooks
  const button0Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[0].value }],
  }));
  const button1Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[1].value }],
  }));
  const button2Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[2].value }],
  }));
  const button3Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[3].value }],
  }));
  const button4Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[4].value }],
  }));
  const button5Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[5].value }],
  }));
  const button6Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[6].value }],
  }));
  const button7Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[7].value }],
  }));
  const button8Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[8].value }],
  }));
  const button9Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[9].value }],
  }));
  const button10Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[10].value }],
  }));
  const button11Style = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScales[11].value }],
  }));

  // Create array reference for easier access
  const buttonAnimatedStyles = [
    button0Style,
    button1Style,
    button2Style,
    button3Style,
    button4Style,
    button5Style,
    button6Style,
    button7Style,
    button8Style,
    button9Style,
    button10Style,
    button11Style,
  ];

  const animateButtonPress = (index: number) => {
    buttonScales[index].value = withSpring(
      0.95,
      { damping: 15, stiffness: 400 },
      () => {
        buttonScales[index].value = withSpring(1, {
          damping: 15,
          stiffness: 400,
        });
      }
    );
  };

  const handleNumberPress = (digit: string) => {
    const index = digit === "0" ? 9 : parseInt(digit) - 1;
    animateButtonPress(index);

    if (displayValue === "0" && digit !== ".") {
      setDisplayValue(digit);
    } else if (displayValue.length < 6) {
      // Limit to reasonable length
      setDisplayValue((prev) => prev + digit);
    }
  };

  const handleDecimalPress = () => {
    animateButtonPress(10); // Decimal button is at index 10

    if (!hasDecimal && displayValue.length < 5) {
      setDisplayValue((prev) => prev + ".");
      setHasDecimal(true);
    }
  };

  const handleBackspace = () => {
    animateButtonPress(11); // Backspace button is at index 11

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
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isValidValue = () => {
    const numValue = parseFloat(displayValue);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
  };

  // Digit button component
  const DigitButton: React.FC<{
    digit: string;
    index: number;
    accessibilityLabel: string;
  }> = ({ digit, index, accessibilityLabel }) => (
    <Animated.View
      style={[styles.digitButtonContainer, buttonAnimatedStyles[index]]}
    >
      <TouchableOpacity
        style={styles.digitButton}
        onPress={() => handleNumberPress(digit)}
        accessibilityRole="keyboardkey"
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.7}
      >
        <Text style={styles.digitText}>{digit}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {visible && (
        <>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={handleClose}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Close keypad"
            />
          </Animated.View>

          <Animated.View style={[styles.keypadContainer, animatedKeypadStyle]}>
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
                <DigitButton digit="1" index={0} accessibilityLabel="1" />
                <DigitButton digit="2" index={1} accessibilityLabel="2" />
                <DigitButton digit="3" index={2} accessibilityLabel="3" />
              </View>

              {/* Row 2: 4, 5, 6 */}
              <View style={styles.keypadRow}>
                <DigitButton digit="4" index={3} accessibilityLabel="4" />
                <DigitButton digit="5" index={4} accessibilityLabel="5" />
                <DigitButton digit="6" index={5} accessibilityLabel="6" />
              </View>

              {/* Row 3: 7, 8, 9 */}
              <View style={styles.keypadRow}>
                <DigitButton digit="7" index={6} accessibilityLabel="7" />
                <DigitButton digit="8" index={7} accessibilityLabel="8" />
                <DigitButton digit="9" index={8} accessibilityLabel="9" />
              </View>

              {/* Row 4: decimal, 0, backspace */}
              <View style={styles.keypadRow}>
                <Animated.View
                  style={[
                    styles.digitButtonContainer,
                    buttonAnimatedStyles[10],
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
                    activeOpacity={0.7}
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

                <DigitButton digit="0" index={9} accessibilityLabel="0" />

                <Animated.View
                  style={[
                    styles.digitButtonContainer,
                    buttonAnimatedStyles[11],
                  ]}
                >
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleBackspace}
                    accessibilityRole="keyboardkey"
                    accessibilityLabel="delete last digit"
                    activeOpacity={0.7}
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
                onPress={handleClose}
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
          </Animated.View>
        </>
      )}
    </Modal>
  );
};

import React, { useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { CaretRightIcon } from "phosphor-react-native";

import { useTheme } from "@/theme";
import { createStyles } from "./InputAccessory.styles";

interface InputAccessoryViewProps {
  primaryText?: string;
  onPrimaryPress: () => void;
  isValid: boolean;
  secondaryText?: string;
  onSecondaryPress?: () => void;
  accessibilityLabel: string;
}

export function InputAccessoryView({
  primaryText = "Continue",
  onPrimaryPress,
  isValid,
  secondaryText,
  onSecondaryPress,
  accessibilityLabel,
}: InputAccessoryViewProps) {
  const { colors, theme: themeObj } = useTheme();
  const styles = useMemo(() => createStyles(colors, themeObj), [colors, themeObj]);

  const hasSecondaryButton = secondaryText && onSecondaryPress;

  return (
    <View style={styles.inputAccessoryContainer}>
      <View style={styles.inputAccessoryContent}>
        <View style={[
          hasSecondaryButton ? styles.buttonsContainer : styles.singleButtonContainer
        ]}>
          {/* Secondary Button (Left) */}
          {hasSecondaryButton && (
            <TouchableOpacity
              style={[styles.buttonBase, styles.secondaryButton]}
              onPress={onSecondaryPress}
              accessibilityRole="button"
              accessibilityLabel={`${secondaryText} button`}
            >
              <Text style={styles.secondaryButtonText}>
                {secondaryText}
              </Text>
              <CaretRightIcon 
                size={20} 
                color={colors.primaryText} 
              />
            </TouchableOpacity>
          )}

          {/* Primary Button (Right, or full width if single) */}
          <TouchableOpacity
            style={[
              styles.buttonBase,
              styles.primaryButton,
              !isValid && styles.primaryButtonDisabled,
              !hasSecondaryButton && { flex: 1 },
            ]}
            onPress={onPrimaryPress}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
          >
            <Text 
              style={[
                styles.primaryButtonText,
                !isValid && styles.primaryButtonTextDisabled,
              ]}
            >
              {primaryText}
            </Text>
            <CaretRightIcon 
              size={20} 
              color={isValid ? "#FFFFFF" : colors.disabledText} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
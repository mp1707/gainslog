import React, { useMemo } from "react";
import { View, TouchableOpacity, Text, InputAccessoryView, StyleSheet } from "react-native";
import { CaretRightIcon } from "phosphor-react-native";

import { useTheme } from "@/theme";

interface CalculatorInputAccessoryProps {
  nativeID: string;
  isValid: boolean;
  onContinue: () => void;
  buttonText?: string;
  accessibilityLabel: string;
}

export function CalculatorInputAccessory({
  nativeID,
  isValid,
  onContinue,
  buttonText = "Continue",
  accessibilityLabel,
}: CalculatorInputAccessoryProps) {
  const { colors, theme: themeObj } = useTheme();

  const styles = useMemo(() => {
    const { spacing, typography } = themeObj;

    return StyleSheet.create({
      inputAccessoryContainer: {
        backgroundColor: colors.secondaryBackground,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
      },
      inputAccessoryContent: {
        padding: spacing.sm,
      },
      accessoryContinueButton: {
        backgroundColor: colors.accent,
        borderRadius: themeObj.components.buttons.cornerRadius,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
      },
      accessoryContinueButtonText: {
        fontSize: typography.Button.fontSize,
        fontFamily: typography.Button.fontFamily,
        color: "#FFFFFF",
        fontWeight: "600",
        marginRight: spacing.sm,
      },
      accessoryContinueButtonDisabled: {
        backgroundColor: colors.disabledBackground,
      },
      accessoryContinueButtonTextDisabled: {
        color: colors.disabledText,
      },
    });
  }, [colors, themeObj]);

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.inputAccessoryContainer}>
        <View style={styles.inputAccessoryContent}>
          <TouchableOpacity
            style={[
              styles.accessoryContinueButton,
              !isValid && styles.accessoryContinueButtonDisabled,
            ]}
            onPress={onContinue}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
          >
            <Text 
              style={[
                styles.accessoryContinueButtonText,
                !isValid && styles.accessoryContinueButtonTextDisabled,
              ]}
            >
              {buttonText}
            </Text>
            <CaretRightIcon 
              size={20} 
              color={isValid ? "#FFFFFF" : colors.disabledText} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </InputAccessoryView>
  );
}
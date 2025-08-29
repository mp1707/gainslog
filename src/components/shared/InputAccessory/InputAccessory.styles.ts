import { StyleSheet } from "react-native";
import { Colors, Theme } from "@/theme/theme";

export const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing, typography, components } = theme;

  return StyleSheet.create({
    inputAccessoryContainer: {
      backgroundColor: colors.secondaryBackground,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    inputAccessoryContent: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    buttonsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    buttonBase: {
      borderRadius: components.buttons.cornerRadius,
      // paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      minWidth: 150,
      flex: 1,
    },
    primaryButtonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    primaryButtonDisabled: {
      backgroundColor: colors.disabledBackground,
    },
    primaryButtonTextDisabled: {
      color: colors.disabledText,
    },
    secondaryButton: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
    },
    secondaryButtonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: colors.primaryText,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    tertiaryButton: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
    },
    tertiaryButtonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: colors.accent,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    singleButtonContainer: {
      // When only one button, it should take full width
    },
  });
};

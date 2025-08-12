import { StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

export const createStyles = (colors: Colors, theme: Theme) => {
  const { typography, spacing, components } = theme;

  return StyleSheet.create({
    button: {
      width: spacing.xl + spacing.sm, // 40pt (32 + 8)
      height: spacing.xl + spacing.sm, // 40pt (32 + 8)
      borderRadius: spacing.lg, // 20pt (24/2 = rounded)
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: spacing.sm,
      elevation: 3,
    },
    primaryButton: {
      height: components.aiActionTargets.height,
      minWidth: components.aiActionTargets.minWidth,
      borderRadius: components.buttons.cornerRadius,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      paddingHorizontal: spacing.lg,
      // No shadows per design system button rules
    },
    primaryButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      fontWeight: typography.Button.fontWeight,
      marginLeft: spacing.sm,
    },
  });
};

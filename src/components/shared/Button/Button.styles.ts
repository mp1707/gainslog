import { StyleSheet } from "react-native";
import type { Colors, ColorScheme, Theme, Typography } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme,
  fontScale: number
) => {
  const componentStyles = theme.getComponentStyles(colorScheme);
  const { typography } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: componentStyles.buttons.cornerRadius,
      paddingVertical: Math.max(12 * fontScale, 12),
      paddingHorizontal: Math.max(16 * fontScale, 16),
      minHeight: 44 * fontScale, // iOS recommended minimum tap target
    },
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.secondaryBackground,
    },
    tertiary: {
      backgroundColor: colors.subtleBackground,
    },
    disabled: {
      backgroundColor: colors.disabledBackground,
    },
    label: {
      ...typography.Button,
      fontSize: typography.Button.fontSize * fontScale,
      textAlign: "center",
    },
    labelPrimary: {
      color: colors.black,
    },
    labelSecondary: {
      color: colors.primaryText,
    },
    labelTertiary: {
      color: colors.primaryText,
    },
    labelDisabled: {
      color: colors.disabledText,
    },
    iconContainer: {
      marginHorizontal: Math.max(4 * fontScale, 4),
    },
    iconLeft: {
      marginRight: Math.max(8 * fontScale, 8),
      marginLeft: 0,
    },
    iconRight: {
      marginLeft: Math.max(8 * fontScale, 8),
      marginRight: 0,
    },
  });
};

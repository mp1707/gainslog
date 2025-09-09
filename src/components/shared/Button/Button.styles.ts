import { StyleSheet } from "react-native";
import type { Colors, ColorScheme, Theme, Typography } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  fontScale: number
) => {
  const { typography } = theme;
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9999,
      paddingVertical: Math.max(12 * fontScale, 12),
      paddingHorizontal: Math.max(16 * fontScale, 16),
      minHeight: 44 * fontScale,
      flexShrink: 1, // ✅ allow button to shrink if needed
      minWidth: 0, // ✅ required so child text can ellipsize
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
      flexShrink: 1,
      minWidth: 0,
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

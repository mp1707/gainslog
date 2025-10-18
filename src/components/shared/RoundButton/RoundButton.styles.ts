import { StyleSheet } from "react-native";
import type { Colors, ColorScheme, Theme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) => {
  const componentStyles = theme.getComponentStyles(colorScheme);

  return StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 1000, // Ensures perfect circle regardless of size
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
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
  });
};

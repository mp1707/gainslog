import { StyleSheet } from "react-native";
import { theme as defaultTheme } from "../../../../theme";

// Factory function to create scheme-aware styles
export const createStyles = (
  colors: ReturnType<typeof defaultTheme.getColors>,
  themeObj: typeof defaultTheme = defaultTheme
) => {
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    container: {
      paddingHorizontal: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md * 1.5, // 12
    },
    label: {
      fontSize: typography.Body.fontSize,
      fontWeight: typography.Headline.fontWeight,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      letterSpacing: -0.4,
    },
    value: {
      fontSize: typography.Body.fontSize,
      fontWeight: typography.Headline.fontWeight,
      fontFamily: typography.Body.fontFamily,
      color: colors.accent,
      letterSpacing: -0.4,
      minWidth: 70,
      textAlign: "right",
    },
    sliderContainer: {
      paddingHorizontal: 8,
    },
    slider: {
      width: "100%",
      height: 44,
      marginVertical: 8,
    },
    rangeLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    rangeLabel: {
      fontSize: typography.Caption.fontSize,
      fontWeight: typography.Caption.fontWeight,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      letterSpacing: -0.08,
    },
  });
};

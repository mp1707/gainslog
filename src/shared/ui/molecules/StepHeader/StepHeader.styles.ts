import { StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

export const createStyles = (colors: Colors, themeObj: Theme) => {
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    stepHeader: {
      marginBottom: spacing.lg,
    },
    stepTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.sm,
    },
    stepNumberContainer: {
      marginRight: spacing.md,
      marginTop: spacing.xs,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    stepNumberText: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      fontWeight: "700",
    },
    stepTitleContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    stepDescription: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 22,
    },
  });
};

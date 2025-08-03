import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../../theme";

// Derive Colors and Theme types from the central theme file
// This keeps the style factory purely functional and scheme-aware.
type Colors = ReturnType<typeof defaultTheme.getColors>;
type Theme = typeof defaultTheme;

export const createStyles = (
  colors: Colors,
  themeObj: Theme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  // Retrieve scheme-aware component styles
  const componentStyles = themeObj.getComponentStyles(scheme);
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    nutritionCard: {
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...componentStyles.cards,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    cardTitleSection: {
      flex: 1,
      marginRight: spacing.md,
    },
    cardDescription: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    nutritionHeadline: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    macroDistributionInfo: {
      backgroundColor: `${colors.accent}10`,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.accent}20`,
    },
    macroDistributionText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      marginBottom: spacing.xs,
      flex: 1,
    },
    macroBreakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    macroColorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
  });
};

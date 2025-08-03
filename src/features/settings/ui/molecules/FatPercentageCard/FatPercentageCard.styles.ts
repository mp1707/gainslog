import { StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

export const createStyles = (
  colors: Colors,
  themeObj: Theme,
) => {
  const componentStyles = themeObj.getComponentStyles();
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
    educationalCallout: {
      backgroundColor: `${colors.semantic.fat}10`,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: colors.semantic.fat,
    },
    educationalTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs,
    },
    educationalText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      lineHeight: 22,
    },
    fatCalculatedInfo: {
      backgroundColor: colors.semanticBadges.fat.background,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    fatCalculatedText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.semantic.fat,
      textAlign: "center",
      fontWeight: "600",
    },
    fatCalculatedInfoRecommended: {
      backgroundColor: colors.semanticBadges.calories.background,
      borderWidth: 1,
      borderColor: `${colors.semantic.calories}30`,
    },
  });
};
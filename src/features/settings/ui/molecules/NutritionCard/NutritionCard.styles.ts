import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../../theme";

// Derive Colors and Theme types from the central theme file to avoid hook coupling
// This keeps the style factory purely functional and easier to test.
type Colors = ReturnType<typeof defaultTheme.getColors>;
type Theme = typeof defaultTheme;

export const createStyles = (
  colors: Colors,
  themeObj: Theme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  // Retrieve component styles for the *current* color scheme so that
  // backgroundColor and other scheme-dependent values update correctly.
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
    nutritionCardFlat: {
      borderRadius: 0,
      marginBottom: 0,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: "transparent",
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
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
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      marginTop: spacing.xs,
      lineHeight: typography.Body.fontSize * 1.33, // Better line height for readability
    },
    nutritionHeadline: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    calculationInfo: {
      backgroundColor: colors.semanticBadges.calories.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.calories,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationInfoProtein: {
      backgroundColor: colors.semanticBadges.protein.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.protein,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationHeader: {
      marginBottom: spacing.sm,
    },
    calculationMethodTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    bodyWeightText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      opacity: 0.8,
    },
    calculatedValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.semantic.calories,
      marginBottom: spacing.sm,
    },
    calculatedValueProtein: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.semantic.protein,
      marginBottom: spacing.sm,
    },
    calculationSubtext: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: typography.Body.fontSize * 1.2,
      opacity: 0.7,
    },
    settingsGroup: {
      backgroundColor: "transparent",
    },
    nutritionSettingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: spacing.lg,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingLabel: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    settingSubtext: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: typography.Body.fontSize * 1.33,
      opacity: 0.8,
    },
    // New section styles for improved UX - using proper design system
    recommendedSection: {
      marginBottom: spacing.xl,
    },
    recommendedSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    sectionLabel: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      opacity: 0.7,
      marginBottom: spacing.xs,
    },
    sectionDescription: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: typography.Body.fontSize * 1.2, // 1.2 line height ratio
      marginBottom: spacing.lg,
    },
    manualOverrideSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.lg,
    },
    manualOverrideSectionHeader: {
      marginBottom: spacing.lg,
    },
  });
};

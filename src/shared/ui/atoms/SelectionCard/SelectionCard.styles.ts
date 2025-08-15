import { StyleSheet } from "react-native";
import { ColorScheme, theme, Colors } from "@/theme";

export const createStyles = (colors: Colors, colorScheme: ColorScheme) => {
  const componentStyles = theme.getComponentStyles(colorScheme);
  const { typography, spacing } = theme;

  return StyleSheet.create({
    // Simple layout styles (like SelectionCard)
    simpleCard: {
      ...componentStyles.cards,
      borderRadius: componentStyles.cards.cornerRadius,
      borderWidth: 2,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 100,
    },

    // Complex layout styles (like Goal/CalorieCalculationCard)
    complexCard: {
      ...componentStyles.cards,
      borderRadius: componentStyles.cards.cornerRadius,
      borderWidth: 2,
      borderColor: "transparent",
      padding: spacing.md,
      marginBottom: spacing.md,
    },

    // Selected state
    selectedCard: {
      borderColor: colors.accent,
      backgroundColor: colorScheme === "light"
        ? "rgba(98, 0, 234, 0.05)"
        : "rgba(124, 77, 255, 0.1)",
    },

    // Simple layout components
    simpleIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryBackground,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.lg,
    },

    simpleTextContainer: {
      flex: 1,
    },

    simpleTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },

    simpleDescription: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 20,
    },

    // Complex layout components
    complexContent: {
      flexDirection: "column",
    },

    complexHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },

    complexIconContainer: {
      marginRight: spacing.md,
    },

    complexTextContainer: {
      flex: 1,
    },

    complexTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },

    complexDescription: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      lineHeight: 16,
    },

    // Selected text states
    selectedTitle: {
      color: colors.accent,
    },

    selectedDescription: {
      color: colors.primaryText,
    },

    // Content section
    contentSection: {
      marginTop: spacing.sm,
    },

    // Single calorie display
    singleCalorieContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.xs,
    },

    // Multiple calories display
    multipleCaloriesContainer: {
      backgroundColor: colorScheme === "light"
        ? "rgba(17, 17, 17, 0.05)"
        : "rgba(242, 242, 247, 0.05)",
      borderRadius: spacing.sm,
      padding: spacing.sm,
    },

    calorieRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs / 2,
    },

    calorieLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },

    calorieValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },

    selectedCalorieValue: {
      color: colors.accent,
    },
  });
};
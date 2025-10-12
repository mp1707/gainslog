import { StyleSheet } from "react-native";
import { ColorScheme, theme, Colors } from "@/theme";

export const createStyles = (colors: Colors, colorScheme: ColorScheme) => {
  const componentStyles = theme.getComponentStyles(colorScheme);
  const { typography, spacing } = theme;

  return StyleSheet.create({
    // Main card container
    card: {
      ...componentStyles.cards,
      borderRadius: componentStyles.cards.cornerRadius,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: "transparent",
    },

    // Selected state
    selectedCard: {
      borderColor: colors.highlightBorder,
      backgroundColor:
        colorScheme === "dark"
          ? `${colors.accent}0D` // ~5% opacity for dark mode
          : `${colors.accent}08`, // ~3% opacity for light mode
    },

    // Content container
    content: {
      flexDirection: "column",
    },

    // Header section with icon and text
    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    // Icon container
    iconContainer: {
      marginRight: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryBackground,
      justifyContent: "center",
      alignItems: "center",
    },

    // Selected icon container
    selectedIconContainer: {
      backgroundColor:
        colorScheme === "dark"
          ? `${colors.accent}1A` // ~10% opacity for dark mode
          : `${colors.accent}14`, // ~8% opacity for light mode
    },

    // Text container
    textContainer: {
      flex: 1,
    },

    // Title text
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },

    // Description text
    description: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      lineHeight: 20,
    },

    // Selected text states
    selectedTitle: {
      color: colors.accent,
    },

    // Daily target section
    targetSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
    },

    // Target label
    targetLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },

    // Target value
    targetValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },

    // Selected target value
    selectedTargetValue: {
      color: colors.accent,
    },
  });
};

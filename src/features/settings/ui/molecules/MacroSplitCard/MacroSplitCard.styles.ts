import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../../theme";

type Colors = ReturnType<typeof defaultTheme.getColors>;
type Theme = typeof defaultTheme;

export const createStyles = (
  colors: Colors,
  themeObj: Theme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  const componentStyles = themeObj.getComponentStyles(scheme);
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...componentStyles.cards,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.Headline,
      color: colors.primaryText,
    },
    description: {
      ...typography.Body,
      color: colors.secondaryText,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    // ... Add more styles as needed from the old files
    macroDistributionInfo: {
      backgroundColor: `${colors.accent}10`,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
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
    macroDistributionText: {
      ...typography.Body,
      color: colors.primaryText,
      flex: 1,
    },
    fatCalculatedInfo: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.semanticBadges.fat.background,
    },
    fatCalculatedText: {
      ...typography.Body,
      color: colors.semantic.fat,
      textAlign: "center",
    },
    educationalCallout: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.warningBackground,
    },
    educationalTitle: {
      ...typography.Subhead,
      fontWeight: "600",
      color: colors.warning,
      marginBottom: spacing.xs,
    },
    educationalText: {
      ...typography.Body,
      color: colors.secondaryText,
      lineHeight: 18,
    },
  });
};

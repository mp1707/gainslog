import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";
import { useThemedStyles } from "@/providers/ThemeProvider";

const { typography, spacing } = theme;

export const useStyles = () =>
  useThemedStyles((colors) =>
    StyleSheet.create({
      section: {
        marginBottom: spacing.lg,
      },

      disabledSection: {
        opacity: 0.6,
      },

      title: {
        fontFamily: typography.Headline.fontFamily,
        fontSize: typography.Headline.fontSize,
        fontWeight: typography.Headline.fontWeight,
        color: colors.primaryText,
        marginBottom: spacing.sm,
      },

      disabledTitle: {
        color: colors.secondaryText,
        fontStyle: "italic",
      },

      subtitle: {
        fontFamily: typography.Body.fontFamily,
        fontSize: typography.Body.fontSize,
        fontWeight: typography.Body.fontWeight,
        color: colors.secondaryText,
        marginBottom: spacing.md,
      },

      disabledSubtitle: {
        color: colors.secondaryText,
        fontStyle: "italic",
      },

      grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: spacing.xs,
      },

      inputGroup: {
        width: "48%",
        marginBottom: spacing.md,
      },

      label: {
        fontFamily: typography.Subhead.fontFamily,
        fontSize: typography.Subhead.fontSize,
        fontWeight: typography.Subhead.fontWeight,
        color: colors.primaryText,
        marginBottom: spacing.sm,
      },

      disabledLabel: {
        color: colors.secondaryText,
      },

      // Nutrition-specific label colors using semantic colors
      caloriesLabel: {
        color: colors.semantic?.calories || colors.accent,
      },

      proteinLabel: {
        color: colors.semantic?.protein || colors.accent,
      },

      carbsLabel: {
        color: colors.semantic?.carbs || colors.accent,
      },

      fatLabel: {
        color: colors.semantic?.fat || colors.accent,
      },
    })
  );

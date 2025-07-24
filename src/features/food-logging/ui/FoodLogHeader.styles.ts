import { StyleSheet } from "react-native";
import { colors, spacing, typography, shadows } from "../../../theme";

export const styles = StyleSheet.create({
  // Date navigation
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.layout.elementGap,
    marginBottom: spacing.layout.componentGap,
  },

  navigationArrow: {
    padding: spacing.scale[2],
    borderRadius: spacing.radii.md,
    backgroundColor: colors.surface.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.primary,
    ...shadows.elevation[1],
  },

  navigationArrowDisabled: {
    backgroundColor: colors.surface.depressed,
    borderColor: colors.border.secondary,
    opacity: 0.5,
  },

  datePickerContainer: {
    flexShrink: 0,
  },

  // Progress section
  progressSection: {
    marginBottom: spacing.layout.componentGap,
  },

  progressSectionTitle: {
    ...typography.textStyles.title3,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.layout.elementGap,
  },

  // Nutrition grid layout
  nutritionGrid: {
    flexDirection: "column",
    gap: spacing.layout.elementGap,
    width: "100%",
  },

  nutritionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.layout.elementGap,
  },

  nutritionItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.scale[1],
  },

  nutritionLabelContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: spacing.scale[1],
    alignItems: "center",
  },

  nutritionLabel: {
    width: 70, // fixed width for alignment
    ...typography.textStyles.callout,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    textAlign: "right",
    textTransform: "capitalize",
  },

  // Legacy progress bars
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: colors.surface.secondary,
    borderRadius: spacing.radii.xs,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: spacing.radii.sm,
    minWidth: 1,
  },

  nutritionValue: {
    ...typography.textStyles.footnote,
    color: colors.text.secondary,
    fontFamily: typography.fontFamilies.system,
    textAlign: "center",
  },

  // Enhanced progress bars
  nutritionList: {
    flexDirection: "column",
    gap: spacing.layout.elementGap,
    width: "100%",
  },

  progressContainer: {
    flex: 1,
  },

  progressBackground: {
    width: "100%",
    height: 24, // Increased for better touch targets
    backgroundColor: colors.surface.secondary,
    borderRadius: spacing.radii.sm,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },

  progressText: {
    position: "absolute",
    right: spacing.scale[2],
    ...typography.textStyles.subheadline,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
  },
});

// Helper function to get progress bar colors using updated nutrition colors
export const getProgressColor = (
  type: "protein" | "carbs" | "fat" | "calories"
) => {
  const colorMap = {
    protein: colors.nutrition.protein.primary,
    carbs: colors.nutrition.carbohydrates.primary,
    fat: colors.nutrition.fat.primary,
    calories: colors.nutrition.calories.primary,
  };
  return colorMap[type];
};

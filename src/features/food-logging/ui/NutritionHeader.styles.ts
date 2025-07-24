import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },

  content: {
    flexDirection: "column",
    gap: spacing.md,
  },

  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },

  navigationArrow: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.light,
  },

  navigationArrowDisabled: {
    backgroundColor: colors.background.disabled || colors.background.secondary,
    borderColor: colors.border.disabled || colors.border.light,
    opacity: 0.5,
  },

  datePickerContainer: {
    flexShrink: 0,
    marginLeft: -5,
  },

  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    width: "100%",
  },

  nutritionItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },

  nutritionLabelContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: spacing.xs,
  },

  nutritionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
  },

  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 2,
    minWidth: 1,
  },

  nutritionValue: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
  },
});

// Helper function to get progress bar colors
export const getProgressColor = (
  type: "protein" | "carbs" | "fat" | "calories"
) => {
  return colors.nutrition[type];
};

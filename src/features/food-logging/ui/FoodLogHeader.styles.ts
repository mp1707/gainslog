import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../theme";

export const styles = StyleSheet.create({
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
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.light,
    opacity: 0.5,
  },

  datePickerContainer: {
    flexShrink: 0,
    marginLeft: -5,
  },

  nutritionGrid: {
    flexDirection: "column",
    gap: spacing.md,
    width: "100%",
  },

  nutritionRow: {
    flexDirection: "row",
    alignItems: "center", // ensure vertical centering
    gap: spacing.lg,
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
    width: 70, // fixed width so all bars line-up
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "right",
    textTransform: "capitalize",
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
    borderRadius: 6,
    minWidth: 1,
  },

  nutritionValue: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
  },

  // New list-based layout styles
  nutritionList: {
    flexDirection: "column",
    gap: spacing.md,
    width: "100%",
  },

  progressContainer: {
    flex: 1,
  },

  progressBackground: {
    width: "100%",
    height: 20, // increased height so stats fit inside the bar
    backgroundColor: colors.border.light,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative", // allow absolute positioning of overlay text
  },

  // overlay text shown inside the progress bar background
  progressText: {
    position: "absolute",
    right: spacing.sm,
    top: "15%",
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
  },
});

// Helper function to get progress bar colors
export const getProgressColor = (
  type: "protein" | "carbs" | "fat" | "calories"
) => {
  return colors.nutrition[type];
};

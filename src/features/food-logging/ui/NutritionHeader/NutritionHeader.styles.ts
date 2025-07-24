import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../theme";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingRight: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },

  datePickerContainer: {
    flexShrink: 0,
  },

  nutritionGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginLeft: spacing.sm,
  },

  nutritionItem: {
    width: "48%",
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
export const getProgressColor = (type: "protein" | "carbs" | "fat" | "calories") => {
  return colors.nutrition[type];
};
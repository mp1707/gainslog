import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const createStyles = (colors: any) => StyleSheet.create({
  // Date navigation
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  navigationArrow: {
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: colors.secondaryBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  navigationArrowDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.border,
    opacity: 0.5,
  },

  datePickerContainer: {
    flexShrink: 0,
  },

  // Nutrition list layout
  nutritionList: {
    flexDirection: "column",
    gap: theme.spacing.sm,
    width: "100%",
  },

  nutritionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  nutritionLabel: {
    width: 70, // fixed width for alignment
    textAlign: "right",
    textTransform: "capitalize",
  },

  progressContainer: {
    flex: 1,
  },

  progressBackground: {
    width: "100%",
    height: theme.components.progressBars.height * 3, // 24px for better touch targets
    backgroundColor: colors.disabledBackground,
    borderRadius: theme.components.progressBars.cornerRadius * 2,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },

  progressBar: {
    height: "100%",
    borderRadius: theme.components.progressBars.cornerRadius * 2,
    minWidth: 1,
    position: "absolute",
    left: 0,
    top: 0,
  },

  progressText: {
    position: "absolute",
    right: theme.spacing.sm,
    color: colors.primaryText,
  },
});

// Helper function to get progress bar colors using accent color for all nutrients
export const getProgressColor = (
  type: "protein" | "carbs" | "fat" | "calories"
) => {
  // Using consistent accent color for all progress bars as per design system
  return theme.getColors().accent;
};

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
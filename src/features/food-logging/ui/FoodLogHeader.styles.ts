import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const createStyles = (colors: any) => StyleSheet.create({
  // Card wrapper with proper margins
  cardWrapper: {
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
    paddingTop: theme.spacing.md,
  },

  // Card styling
  card: {
    padding: theme.spacing.md,
  },

  // Date navigation
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
    marginLeft: -10,
  },

  // 2x2 Grid layout for progress indicators
  progressGrid: {
    gap: theme.spacing.lg,
  },

  // Row within the grid
  progressRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },

  // Individual progress item container
  progressItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,

  },

  // Horizontal progress bar row (for carbs/fat)
  nutritionRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing.sm,
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
  },

  nutritionLabel: {
    textAlign: "center",
    position: "absolute",
    top: 5,
    left: 0,
    right: 0,
    bottom: 0,
    textTransform: "capitalize",
  },

  progressContainer: {
    width: "100%",
  },

  progressBackground: {
    width: "100%",
    height: theme.components.progressBars.height * 4, // 24px for better touch targets
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
    alignSelf: "center",
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
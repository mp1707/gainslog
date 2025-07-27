import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },

  scrollView: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
    paddingBottom: 100, // Extra bottom padding for FAB
    gap: theme.spacing.md,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
  },

  // Floating Action Button styles
  fabContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.pageMargins.horizontal,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
    maxWidth: (theme.components.aiActionTargets.minWidth * 2) + theme.spacing.sm,
  },

  fabButton: {
    backgroundColor: colors.accent,
    width: theme.components.aiActionTargets.minWidth,
    height: theme.components.aiActionTargets.height,
    borderRadius: theme.components.buttons.cornerRadius,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },

  fabButtonSecondary: {
    backgroundColor: colors.accent,
  },

  fabButtonTertiary: {
    backgroundColor: colors.accent,
  },

  fabButtonQuaternary: {
    backgroundColor: colors.accent,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Legacy export for compatibility - will be replaced when components are updated
export const styles = createStyles(theme.getColors());
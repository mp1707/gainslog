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
    paddingBottom: 100, // Extra bottom padding for ExpandableFAB
    gap: theme.spacing.md,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
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
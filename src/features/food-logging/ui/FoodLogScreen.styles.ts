import { StyleSheet } from "react-native";
import { theme } from "../../../theme";
import type { Colors } from "../../../theme";

export const createStyles = (colors: Colors, bottomPadding?: number) =>
  StyleSheet.create({
    // Main container styles
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },

    // ScrollView styles
    scrollView: {
      flex: 1,
      paddingTop: theme.spacing.md,
    },
    statsContainer: {
      gap: theme.spacing.md,
    },
    
    scrollContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingBottom: bottomPadding || 100, // Dynamic bottom padding for tab bar and FAB
      gap: theme.spacing.md,
    },

    // Mini summary styles
    miniSummaryWrapper: {
      overflow: "hidden",
    },
    miniSummaryContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    miniSummaryLabel: {
      color: colors.secondaryText,
    },
    miniBadgesRow: {
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
    },

    // Loading state
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

// Legacy export for compatibility - will be replaced when components are updated
export const styles = createStyles(theme.getColors());

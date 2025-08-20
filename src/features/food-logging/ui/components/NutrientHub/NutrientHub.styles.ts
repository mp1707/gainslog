import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      alignSelf: "center",
    },

    animatedContainer: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    badgeLegend: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
      justifyContent: "center",
    },

    expandedBadgeLegend: {
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },

    caloriesRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    macrosRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.xs,
      flexWrap: "wrap",
    },

    compactBadgeLegend: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: 130,
      marginTop: 0,
      gap: 4,
      justifyContent: "space-between",
    },

    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 6,
      minWidth: 70,
      alignItems: "center",
    },

    // Enhanced badge for normal state
    enhancedBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: 12,
      minWidth: 80,
      alignItems: "center",
      gap: theme.spacing.xs,
      shadowColor: "rgba(0, 0, 0, 0.08)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },

    compactBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 8,
      width: 64, // Fixed width for 2x2 grid (8pt grid aligned)
      alignItems: "center",
      gap: theme.spacing.xs / 2, // 2px gap
      shadowColor: "rgba(0, 0, 0, 0.06)",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 1,
    },

    badgeTitle: {
      ...theme.typography.Caption,
      marginBottom: 1,
    },

    // Enhanced badge typography
    enhancedBadgeTitle: {
      ...theme.typography.Subhead,
      fontWeight: "600",
      letterSpacing: 0.1,
    },

    badgeValue: {
      ...theme.typography.Caption,
      color: colors.primaryText,
    },

    enhancedBadgeValue: {
      ...theme.typography.Body,
      fontWeight: "700",
      color: colors.primaryText,
    },

    compactBadgeTitle: {
      ...theme.typography.Caption,
      fontWeight: "600",
      letterSpacing: 0.1,
    },

    compactBadgeValue: {
      ...theme.typography.Caption,
      color: colors.primaryText,
      fontWeight: "700",
    },

    // Badge component layout styles
    badgeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },

    badgePercentage: {
      ...theme.typography.Caption,
      fontSize: 10,
      fontWeight: "500",
      opacity: 0.8,
      lineHeight: 12,
    },

    badgeUnit: {
      ...theme.typography.Caption,
      fontSize: 10,
      fontWeight: "400",
      opacity: 0.7,
      marginTop: 1,
      lineHeight: 12,
    },

    // New style for compact combined value+unit
    enhancedBadgeValueWithUnit: {
      ...theme.typography.Body,
      fontWeight: "700",
      color: colors.primaryText,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
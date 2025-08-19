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
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },

    compactBadgeLegend: {
      flexDirection: "column",
      width: "auto",
      marginTop: 0,
      gap: theme.spacing.xs,
    },

    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 6,
      minWidth: 70,
      alignItems: "center",
    },

    compactBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      width: 62, // Fixed width for 2x2 grid
      alignItems: "center",
    },

    badgeTitle: {
      ...theme.typography.Caption,
      marginBottom: 1,
    },

    badgeValue: {
      ...theme.typography.Caption,
      color: colors.primaryText,
    },

    compactBadgeTitle: {
      ...theme.typography.Caption,
      fontWeight: "600",
      fontSize: 10,
      marginBottom: 1,
    },

    compactBadgeValue: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
      fontSize: 9,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
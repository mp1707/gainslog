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

    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 6,
      minWidth: 70,
      alignItems: "center",
    },

    badgeTitle: {
      ...theme.typography.Caption,
      fontWeight: "600",
      marginBottom: 1,
    },

    badgeValue: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
      fontSize: 11,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
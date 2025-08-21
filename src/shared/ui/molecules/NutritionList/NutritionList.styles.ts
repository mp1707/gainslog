import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    nutritionList: {
      gap: theme.spacing.xs,
    },
    nutritionRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    nutritionDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    nutritionValueContainer: {
      alignItems: "flex-end",
      marginRight: theme.spacing.xs,
    },
    nutritionText: {
      fontSize: theme.typography.Subhead.fontSize,
      fontWeight: "600" as const,
      color: colors.primaryText,
    },
  });
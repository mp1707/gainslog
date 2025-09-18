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
      justifyContent: "flex-start",
      position: "relative",
      overflow: "hidden",
      minHeight: theme.spacing.lg + theme.spacing.xs,
    },
    nutritionDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    nutritionContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    nutritionLoaderLayer: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      overflow: "hidden",
      alignItems: "flex-start",
    },
    nutritionLoaderPlaceholder: {
      width: "100%",
      height: theme.spacing.md,
      borderRadius: theme.spacing.md,
      backgroundColor: colors.subtleBackground,
      opacity: 0.7,
    },
    nutritionText: {
      fontSize: theme.typography.Subhead.fontSize,
      fontWeight: "600" as const,
      color: colors.primaryText,
    },
  });

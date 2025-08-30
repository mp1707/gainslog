import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const createStyles = () =>
  StyleSheet.create({
    container: {
      alignItems: "flex-start",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.sm,
    },
    text: {
      fontSize: theme.typography.Caption.fontSize,
      fontWeight: "600" as const,
    },
  });
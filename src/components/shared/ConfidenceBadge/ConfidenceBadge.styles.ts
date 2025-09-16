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
      paddingVertical: 5, // Match LogStatusBadge padding
      borderRadius: theme.spacing.sm,
      alignSelf: "flex-start",
    },
    text: {
      ...theme.typography.Caption,
      fontWeight: "600" as const,
      lineHeight: 16, // Align text height with icon size for vertical centering
    },
  });
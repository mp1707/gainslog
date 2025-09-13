import { Colors, Theme } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 5, // A bit more vertical padding for balance
      borderRadius: theme.spacing.sm,
      alignSelf: "flex-start",
    },
    text: {
      ...theme.typography.Caption, // Use Caption styles from theme
      fontWeight: "600",
      lineHeight: 16, // Align text height with icon size for vertical centering
    },
  });

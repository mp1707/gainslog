import { StyleSheet } from "react-native";
import { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "flex-start",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.components.cards.cornerRadius,
      alignSelf: "flex-start",
      backgroundColor: colors.semanticBadges.calories.background,
    },
    text: {
      ...theme.typography.Caption,
      fontWeight: "600" as const,
      lineHeight: 16, // Align text height with icon size for vertical centering
      color: colors.accent,
    },
  });

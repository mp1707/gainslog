import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (_colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      gap: theme.spacing.sm,
    },
    content: {
      gap: theme.spacing.sm,
    },
    badge: {
      marginBottom: theme.spacing.xs,
    },
    title: {
      marginBottom: theme.spacing.xs,
    },
    description: {
      marginBottom: theme.spacing.sm,
    },
    button: {
      marginTop: theme.spacing.xs,
    },
    restore: {
      marginTop: theme.spacing.sm,
    },
  });

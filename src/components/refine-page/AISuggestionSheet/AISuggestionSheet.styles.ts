import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    descriptionContainer: {
      marginBottom: theme.spacing.lg,
    },
    highlightText: {
      color: colors.primaryText,
      fontWeight: "600",
    },
    actionButtons: {
      gap: theme.spacing.sm,
    },
    buttonWrapper: {
      width: "100%",
    },
  });

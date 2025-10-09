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
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
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

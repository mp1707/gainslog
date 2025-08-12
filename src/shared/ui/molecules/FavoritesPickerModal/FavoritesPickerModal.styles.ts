import { StyleSheet } from "react-native";

export const createStyles = (colors: any, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
    },
    searchBarContainer: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingBottom: theme.spacing.md,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.md,
    },
    closeText: {
      color: colors.accent,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    card: {
      borderRadius: theme.components.cards.cornerRadius,
    },
    itemTop: {
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    title: {
      color: colors.primaryText,
    },
    itemBottom: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "flex-end",
    },
  });

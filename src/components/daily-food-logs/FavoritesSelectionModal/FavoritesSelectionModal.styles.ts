import { StyleSheet } from "react-native";

export const createStyles = (colors: any, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.primaryBackground,
    },
    closeButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      flex: 1,
      textAlign: "center",
      color: colors.primaryText,
    },
    headerSpacer: {
      width: 44, // Same as closeButton for balance
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    emptyMessage: {
      textAlign: "center",
      lineHeight: 22,
    },
    listContainer: {
      gap: theme.spacing.md,
    },
  });
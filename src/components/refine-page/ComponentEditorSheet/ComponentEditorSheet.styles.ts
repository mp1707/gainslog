import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    sheetTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    fieldGroup: {
      gap: theme.spacing.xs,
    },
    label: {
      color: colors.secondaryText,
      marginLeft: theme.spacing.xs,
    },
    inputWrapper: {
      borderWidth: 1.5,
      backgroundColor: colors.secondaryBackground,
      borderRadius: 999,
    },
    textInput: {
      minHeight: 48,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: colors.primaryText,
      fontFamily: theme.typography.Headline.fontFamily,
      fontSize: theme.typography.Headline.fontSize,
      backgroundColor: colors.primaryBackground,
      borderRadius: 999,
    },
    pickerArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      // Use transparent to let native iOS picker chrome show naturally
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
    },
    pickerCol: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    actionsRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    actionFlex: {
      flex: 1,
    },
  });

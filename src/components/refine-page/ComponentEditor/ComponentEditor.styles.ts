import { StyleSheet, Platform } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.secondaryBackground,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    formSection: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    fieldGroup: {
      gap: theme.spacing.xs,
    },
    flexField: {
      flex: 1,
    },
    unitField: {
      minWidth: 100,
    },
    label: {
      paddingLeft: theme.spacing.xs,
    },
    textInput: {
      backgroundColor: colors.primaryBackground,
      borderRadius: 24, // Pill-shaped
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.Body.fontSize,
      fontFamily: theme.typography.Body.fontFamily,
      color: colors.primaryText,
      minHeight: 48, // Touch target
    },
    rowGroup: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      alignItems: "flex-start",
    },
    unitSelector: {
      backgroundColor: colors.primaryBackground,
      borderRadius: 24, // Pill-shaped
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.xs,
      minHeight: 48, // Touch target
    },
    unitSelectorPressed: {
      backgroundColor: colors.subtleBackground,
    },
    pickerContainer: {
      overflow: "hidden",
      marginTop: theme.spacing.xs,
    },
    picker: {
      flex: 1,
    },
    pickerItemIOS: {
      color: colors.primaryText,
      fontSize: theme.typography.Body.fontSize,
    },
    actionButtons: {
      flexDirection: "row",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      backgroundColor: colors.secondaryBackground,
    },
    buttonWrapper: {
      flex: 1,
    },
  });

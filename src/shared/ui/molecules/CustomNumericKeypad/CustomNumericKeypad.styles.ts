import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "flex-end",
    },
    backdropTouchable: {
      flex: 1,
    },
    keypadContainer: {
      backgroundColor: colors.secondaryBackground,
      borderTopLeftRadius: theme.spacing.md, // 16pt
      borderTopRightRadius: theme.spacing.md, // 16pt
      marginTop: "auto", 
      paddingTop: theme.spacing.lg, // 24pt
      paddingHorizontal: theme.spacing.pageMargins.horizontal, // 20pt
      paddingBottom: theme.spacing.xl, // 32pt
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    displayContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.xl, // 32pt
      paddingHorizontal: theme.spacing.md, // 16pt
      paddingVertical: theme.spacing.lg, // 24pt
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius, // 16pt
      borderWidth: 1,
      borderColor: colors.border,
    },
    displayText: {
      fontSize: 32,
      fontFamily: theme.typography.Title1.fontFamily,
      fontWeight: theme.typography.Title1.fontWeight,
      color: colors.primaryText,
      marginBottom: theme.spacing.xs, // 4pt
      minHeight: 40,
      textAlign: "center",
    },
    rangeText: {
      fontSize: theme.typography.Caption.fontSize, // 13pt
      fontFamily: theme.typography.Caption.fontFamily,
      fontWeight: theme.typography.Caption.fontWeight,
      color: colors.secondaryText,
      textAlign: "center",
    },
    keypadGrid: {
      marginBottom: theme.spacing.lg, // 24pt
    },
    keypadRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md, // 16pt
    },
    digitButton: {
      width: 72, // Large enough for 44pt minimum + padding
      height: 56, // Large enough for 44pt minimum + padding
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.buttons.cornerRadius, // 12pt
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    digitText: {
      fontSize: theme.typography.Title2.fontSize, // 22pt
      fontFamily: theme.typography.Title2.fontFamily,
      fontWeight: theme.typography.Title2.fontWeight,
      color: colors.primaryText,
    },
    actionButton: {
      width: 72,
      height: 56,
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.buttons.cornerRadius, // 12pt
      borderWidth: 1,
      borderColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    disabledButton: {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.6,
    },
    disabledText: {
      color: colors.disabledText,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.md, // 16pt
    },
    cancelButton: {
      flex: 1,
      height: 48, // Above 44pt minimum
      backgroundColor: "transparent",
      borderRadius: theme.components.buttons.cornerRadius, // 12pt
      borderWidth: 1.5,
      borderColor: colors.secondaryText,
      justifyContent: "center",
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: theme.typography.Button.fontSize, // 17pt
      fontFamily: theme.typography.Button.fontFamily,
      fontWeight: theme.typography.Button.fontWeight,
      color: colors.secondaryText,
    },
    submitButton: {
      flex: 1,
      height: 48, // Above 44pt minimum
      backgroundColor: colors.accent,
      borderRadius: theme.components.buttons.cornerRadius, // 12pt
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonText: {
      fontSize: theme.typography.Button.fontSize, // 17pt
      fontFamily: theme.typography.Button.fontFamily,
      fontWeight: theme.typography.Button.fontWeight,
      color: colors.white,
    },
    submitButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonTextDisabled: {
      color: colors.disabledText,
    },
  });

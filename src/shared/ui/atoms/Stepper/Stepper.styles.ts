import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      // maxWidth: 220,
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border + "40", // More subtle border
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
      overflow: "hidden",
    },
    buttonBase: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      position: "relative",
    },
    buttonBasePressed: {
      backgroundColor: colors.accent + "15", // Slightly more opaque pressed state
      transform: [{ scale: 0.96 }],
    },
    buttonBaseFocused: {
      backgroundColor: colors.accent + "10",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    buttonLeft: {
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      borderRightWidth: 0.5,
      borderRightColor: colors.border + "60",
    },
    buttonRight: {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderLeftWidth: 0.5,
      borderLeftColor: colors.border + "60",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "600",
      fontFamily: theme.typography.Button.fontFamily,
      color: colors.accent,
      lineHeight: 20,
    },
    valueBox: {
      minWidth: 72,
      height: 44,
      paddingHorizontal: theme.spacing.sm,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.secondaryBackground,
    },
    valueText: {
      fontSize: theme.typography.Body.fontSize,
      fontWeight: "600",
      fontFamily: theme.typography.Body.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    valueInput: {
      fontSize: theme.typography.Body.fontSize,
      fontWeight: "600",
      fontFamily: theme.typography.Body.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      padding: 0,
      margin: 0,
      minWidth: 72,
      maxWidth: 72,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());

import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1.5,
      borderColor: colors.accent,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    buttonBase: {
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    buttonBasePressed: {
      backgroundColor: colors.accent + "1A", // 10% opacity for pressed state
    },
    buttonBaseFocused: {
      borderWidth: 2,
      borderColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    buttonLeft: {
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      borderRightWidth: 1,
      borderRightColor: colors.border, 
    },
    buttonRight: {
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: "700",
      fontFamily: theme.typography.Button.fontFamily,
      color: colors.accent,
    },
    valueBox: {
      minWidth: 80,
      height: 56,
      paddingHorizontal: theme.spacing.md,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.secondaryBackground,
    },
    valueText: {
      fontSize: theme.typography.Headline.fontSize,
      fontWeight: theme.typography.Headline.fontWeight,
      fontFamily: theme.typography.Headline.fontFamily,
      color: colors.primaryText,
    },
    valueInput: {
      fontSize: theme.typography.Headline.fontSize,
      fontWeight: theme.typography.Headline.fontWeight,
      fontFamily: theme.typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      padding: 0,
      margin: 0,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());

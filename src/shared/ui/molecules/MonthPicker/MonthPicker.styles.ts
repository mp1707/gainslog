import { StyleSheet } from "react-native";
import { theme as defaultTheme } from "../../../../theme";

export const createStyles = (
  colors: any,
  themeObj: typeof defaultTheme = defaultTheme
) => {
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    button: {
      padding: spacing.sm,
      borderRadius: 8,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    disabledButton: {
      opacity: 0.4,
    },
    buttonText: {
      color: colors.primaryText,
    },
    disabledButtonText: {
      color: colors.secondaryText,
    },
    monthText: {
      fontSize: typography.Title2.fontSize,
      fontWeight: typography.Headline.fontWeight,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      marginHorizontal: spacing.xl,
      textAlign: "center",
      minWidth: 150,
    },
  });
};

// Legacy export for compatibility
export const styles = createStyles(defaultTheme.getColors());

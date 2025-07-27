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
      gap: spacing.md,
    },
    navigationArrow: {
      padding: spacing.sm,
      borderRadius: spacing.sm,
      backgroundColor: colors.secondaryBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    navigationArrowDisabled: {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.5,
    },
    monthTextContainer: {
      backgroundColor: colors.disabledBackground,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm - 1,
      borderRadius: spacing.sm,
    },
    monthText: {
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 150,
    },
  });
};

// Legacy export for compatibility
export const styles = createStyles(defaultTheme.getColors());

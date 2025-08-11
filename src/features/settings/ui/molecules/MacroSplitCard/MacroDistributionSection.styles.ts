import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../../theme";

type Colors = ReturnType<typeof defaultTheme.getColors>;
type Theme = typeof defaultTheme;

export const createStyles = (
  colors: Colors,
  themeObj: Theme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  const { spacing, typography } = themeObj;
  const componentStyles = themeObj.getComponentStyles(scheme);

  return StyleSheet.create({
    container: {
      borderRadius: 12,
      paddingTop: spacing.md,
    },
    containerFlat: {
      backgroundColor: "transparent",
    },
    row: {
      flexDirection: "row",
      marginBottom: spacing.lg,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.disabledBackground,
      borderRadius: 999,
      flex: 1,
      marginRight: spacing.md,
    },
    pillRight: {
      marginRight: 0,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: spacing.sm,
    },
    pillText: {
      ...typography.Body,
      color: colors.primaryText,
    },
    sliderBlock: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.lg,
    },
    sliderLabel: {
      ...typography.Subhead,
      color: colors.primaryText,
      marginBottom: spacing.sm,
      fontWeight: "600",
    },
    helperText: {
      ...typography.Caption,
      color: colors.secondaryText,
      marginTop: spacing.sm,
    },
  });
};

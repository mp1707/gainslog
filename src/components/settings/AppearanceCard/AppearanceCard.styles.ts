import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../theme";

type Colors = ReturnType<typeof defaultTheme.getColors>;
type Theme = typeof defaultTheme;

export const createStyles = (
  colors: Colors,
  themeObj: Theme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  const componentStyles = themeObj.getComponentStyles(scheme);
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    nutritionCard: {
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...componentStyles.cards,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingLabel: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    settingSubtext: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 20,
      opacity: 0.8,
    },
  });
};

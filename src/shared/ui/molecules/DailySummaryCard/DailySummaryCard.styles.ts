import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../theme";

export const createStyles = (
  colors: any,
  themeObj: typeof defaultTheme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  const componentStyles = themeObj.getComponentStyles(scheme);

  return StyleSheet.create({
    container: {
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: themeObj.spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...componentStyles.cards, // Apply scheme-aware card styles
    },
    dateText: {
      fontSize: themeObj.typography.Title2.fontSize,
      fontWeight: themeObj.typography.Title2.fontWeight,
      fontFamily: themeObj.typography.Title2.fontFamily,
      color: colors.primaryText,
      marginBottom: themeObj.spacing.md,
    },
    nutritionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    nutritionItem: {
      width: "48%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: themeObj.spacing.xs,
    },
    label: {
      fontSize: themeObj.typography.Subhead.fontSize,
      fontWeight: themeObj.typography.Subhead.fontWeight,
      fontFamily: themeObj.typography.Subhead.fontFamily,
    },
    value: {
      fontSize: themeObj.typography.Subhead.fontSize,
      fontWeight: themeObj.typography.Headline.fontWeight,
      fontFamily: themeObj.typography.Headline.fontFamily,
    },
    metColor: {
      color: colors.accent,
    },
    notMetColor: {
      color: colors.secondaryText,
    },
    backgroundOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: themeObj.components.cards.cornerRadius,
    },
  });
};

// Legacy export for compatibility (static scheme)
export const styles = createStyles(defaultTheme.getColors());

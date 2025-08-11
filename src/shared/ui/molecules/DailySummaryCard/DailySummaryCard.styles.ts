import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "../../../../theme";

export const createStyles = (
  colors: any,
  themeObj: typeof defaultTheme = defaultTheme,
  scheme: ColorScheme = "light"
) => {
  const componentStyles = themeObj.getComponentStyles(scheme);

  return StyleSheet.create({
    cardContainer: {
      // Container for the animated card and overlays
    },
    card: {
      padding: themeObj.spacing.lg,
      gap: themeObj.spacing.md,
    },
    dateText: {
      fontSize: themeObj.typography.Title2.fontSize,
      fontWeight: themeObj.typography.Title2.fontWeight,
      fontFamily: themeObj.typography.Title2.fontFamily,
      color: colors.primaryText,
      marginBottom: themeObj.spacing.md,
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: themeObj.spacing.sm,
    },
    pressOverlay: {
      position: "absolute",
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

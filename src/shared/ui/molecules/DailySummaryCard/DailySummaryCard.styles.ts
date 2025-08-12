import { StyleSheet } from "react-native";
import { ColorScheme, theme as defaultTheme } from "@/theme";

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
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: themeObj.spacing.lg,
    },
    dateColumn: {
      flexShrink: 0,
      width: 96,
    },
    dateText: {
      fontSize: themeObj.typography.Title2.fontSize,
      fontWeight: themeObj.typography.Title2.fontWeight,
      fontFamily: themeObj.typography.Title2.fontFamily,
      color: colors.primaryText,
      marginBottom: themeObj.spacing.md,
    },
    // legacy badges removed in redesign
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

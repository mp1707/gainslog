// Toggle.styles.ts
import { StyleSheet, PixelRatio } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, colorScheme: ColorScheme) => {
  const fontScale = PixelRatio.getFontScale();
  const baseHeight = 40;
  const scaledHeight = Math.max(44, baseHeight * fontScale);
  const containerPadding = 2;
  const sliderHeight = scaledHeight - containerPadding * 2;

  return StyleSheet.create({
    toggleContainer: {
      flexDirection: "row",
      borderRadius: theme.components.buttons.cornerRadius,
      overflow: "hidden",
      position: "relative",
      minHeight: scaledHeight,
      backgroundColor: colors.subtleBackground,
      borderWidth: 1,
      borderColor: colors.subtleBorder,
      padding: containerPadding,
    },

      toggleSlider: {
        position: "absolute",
        top: containerPadding,
        left: containerPadding,
        height: sliderHeight,
        backgroundColor: colors.accent,
        borderRadius: theme.components.buttons.cornerRadius - 2 ,
        zIndex: 1,
        shadowColor: "rgba(0, 0, 0, 0.12)",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 2,
      },

      toggleButton: {
        flex: 1,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        zIndex: 2,
        minHeight: sliderHeight,
      },

      toggleButtonText: {
        fontSize: 14,
        fontFamily: theme.typography.Body.fontFamily,
        fontWeight: "400",
        color: colors.secondaryText,
      },

      toggleButtonTextSelected: {
        fontSize: 14,
        fontFamily: theme.typography.Body.fontFamily,
        fontWeight: "600",
        // Use white on light theme, black on dark theme for contrast on bright accent
        color: colorScheme === "light" ? "#FFFFFF" : "#000000",
      },
    });
};

// Toggle.styles.ts
import { StyleSheet, PixelRatio } from "react-native";
import { useThemedStyles } from "@/theme";

export const useStyles = () =>
  useThemedStyles((colors, theme) => {
    const fontScale = PixelRatio.getFontScale();
    const baseHeight = 40;
    const scaledHeight = Math.max(44, baseHeight * fontScale);
    const containerPadding = 2;
    const sliderHeight = scaledHeight - containerPadding * 2;

    return StyleSheet.create({
      toggleContainer: {
        flexDirection: "row",
        borderRadius: theme.components.cards.cornerRadius,
        overflow: "hidden",
        position: "relative",
        minHeight: scaledHeight,
        backgroundColor:
          colors.primaryText === "#1A1A1A" ? "#F2F2F7" : "#2C2C2E",
        padding: containerPadding,
      },

      toggleSlider: {
        position: "absolute",
        top: containerPadding,
        left: containerPadding,
        height: sliderHeight,
        backgroundColor: colors.secondaryBackground,
        borderRadius: theme.components.cards.cornerRadius,
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
        color: colors.primaryText,
      },
    });
  });

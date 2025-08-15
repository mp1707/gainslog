import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/providers/ThemeProvider";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      toggleContainer: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        minHeight: 46,
        backgroundColor: colors.disabledBackground,
      },

      toggleSlider: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "50%",
        height: "100%",
        backgroundColor: colors.accent,
        borderRadius: 12,
        zIndex: 1,
      },

      toggleButton: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        zIndex: 2,
        minHeight: 46,
      },

      toggleButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.xs, // Small gap between icon and text
      },

      toggleButtonText: {
        fontSize: theme.typography.Body.fontSize,
        fontFamily: theme.typography.Body.fontFamily,
        fontWeight: theme.typography.Body.fontWeight,
        color: colors.primaryText,
      },

      toggleButtonTextSelected: {
        color: colors.white,
      },
    })
  );

import { StyleSheet } from "react-native";
import { useThemedStyles } from "../../../../providers/ThemeProvider";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      toggleContainer: {
        flexDirection: "row",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: colors.accent,
        position: "relative",
        minHeight: 46,
        padding: 4, // 3pt padding creates breathing room between slider and border
      },

      toggleSlider: {
        position: "absolute",
        top: 3, // Matches container padding
        left: 3, // Matches container padding
        width: "50%",
        height: 43,
        backgroundColor: colors.accent,
        borderRadius: 8, // Smaller radius for better proportions
        zIndex: 1,
      },

      toggleButton: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2, // 10pt vertical padding
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        zIndex: 2,
        minHeight: 40, // Reduced to account for container padding
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
        color: colors.accent,
      },

      toggleButtonTextSelected: {
        color: colors.white,
      },
    })
  );
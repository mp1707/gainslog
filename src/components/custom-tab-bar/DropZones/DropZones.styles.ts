import { StyleSheet, Dimensions } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) => {
  const isDarkMode = colorScheme === "dark";

  // Use semantic background colors from theme with appropriate opacity
  const dropZoneGradientColors = isDarkMode
    ? ([
        `${colors.secondaryBackground}D9`,
        `${colors.secondaryBackground}F2`,
      ] as const)
    : ([
        `${colors.secondaryBackground}D9`,
        `${colors.primaryBackground}F2`,
      ] as const);

  const iconGlowGradientColors = isDarkMode
    ? ([`${colors.accent}4D`, `${colors.accent}00`] as const)
    : ([`${colors.accent}66`, `${colors.accent}0D`] as const);

  const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    dimOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode
        ? "rgba(0, 0, 0, 0.6)"
        : "rgba(0, 0, 0, 0.25)",
    },
    dropZonesContainer: {
      flex: 1,
      justifyContent: "flex-end",
      paddingHorizontal: theme.spacing.md,
      paddingTop: 60,
      paddingBottom: 120,
      gap: theme.spacing.md,
    },
    dropZone: {
      height: SCREEN_HEIGHT * 0.3,
      borderRadius: theme.components.cards.cornerRadius,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
      overflow: "hidden",
    },
    iconContainer: {
      width: 90,
      height: 90,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
      borderRadius: 45,
      overflow: "hidden",
      backgroundColor: colors.primaryBackground,
    },
    // selectedBorder style moved to animated style in component
    iconGlow: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: 45,
    },
    // Typography styles are now handled by AppText component
    // dropZoneTitle and dropZoneSubtitle styles removed
  });

  return { styles, dropZoneGradientColors, iconGlowGradientColors };
};

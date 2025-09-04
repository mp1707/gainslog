import { StyleSheet, Dimensions } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) => {
  const isDarkMode = colorScheme === "dark";

  // By adding `as const`, we tell TypeScript to infer the type as a readonly tuple
  // (e.g., `readonly ["rgba(...)", "rgba(...)"]`) instead of a mutable `string[]`.
  // This satisfies the type requirement for the LinearGradient component's `colors` prop.
  const dropZoneGradientColors = isDarkMode
    ? (["rgba(36, 36, 38, 0.85)", "rgba(28, 28, 30, 0.95)"] as const)
    : (["rgba(255, 255, 255, 0.85)", "rgba(242, 242, 247, 0.95)"] as const);

  const iconGlowGradientColors = isDarkMode
    ? ([`${colors.accent}30`, `${colors.accent}00`] as const)
    : ([`${colors.accent}40`, `${colors.accent}05`] as const);

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
      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)",
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
      borderRadius: theme.spacing.xl + theme.spacing.sm,
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
    },
    iconGlow: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: 45,
    },
    dropZoneTitle: {
      ...theme.typography.Title2,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },
    dropZoneSubtitle: {
      ...theme.typography.Body,
      color: colors.secondaryText,
      textAlign: "center",
      maxWidth: "85%",
    },
  });

  return { styles, dropZoneGradientColors, iconGlowGradientColors };
};

import { StyleSheet, Dimensions } from "react-native";
import type { Colors, Theme } from "@/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000, // High z-index to appear above everything
      pointerEvents: "none", // Allow gestures to pass through
    },
    blurView: {
      flex: 1,
      position: "relative",
    },
    dimOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor:
        colors.primaryBackground === colors.black
          ? "rgba(0, 0, 0, 0.7)" // Darker overlay for dark mode
          : "rgba(0, 0, 0, 0.6)", // Slightly darker for light mode
    },
    dropZonesContainer: {
      flex: 1,
      justifyContent: "flex-end", // Align to bottom for thumb accessibility
      paddingHorizontal: theme.spacing.xl,
      paddingTop: 60, // Reduced safe area top
      paddingBottom: 140, // More space from bottom to account for tab bar
      gap: theme.spacing.lg, // Space between zones
    },
    dropZone: {
      height: SCREEN_HEIGHT * 0.3, // 30% of screen height as requested
      borderRadius: theme.spacing.xl,
      borderWidth: 3,
      borderStyle: "dashed",
      borderColor: colors.accent,
      backgroundColor:
        colors.primaryBackground === colors.black
          ? "rgba(255, 255, 255, 0.12)" // More visible in dark mode
          : "rgba(255, 255, 255, 0.15)", // More visible in light mode
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    cameraZone: {
      // Additional styling for camera zone if needed
    },
    microphoneZone: {
      // Additional styling for microphone zone if needed
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
      shadowColor: colors.accent,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    dropZoneTitle: {
      ...theme.typography.Title2,
      color: colors.accent,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    dropZoneSubtitle: {
      ...theme.typography.Body,
      color:
        colors.primaryBackground === colors.black
          ? colors.primaryText // High contrast in dark mode
          : colors.secondaryText, // Keep secondary in light mode
      textAlign: "center",
      opacity:
        colors.primaryBackground === colors.black
          ? 0.9 // Higher opacity in dark mode for better visibility
          : 0.8,
    },
  });

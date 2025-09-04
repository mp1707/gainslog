import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      width: "100%",
      zIndex: 99,
      // Enhanced container styling for better hierarchy
    },
    content: {
      width: "100%",
      paddingTop: theme.spacing.sm,
      flexDirection: "row",
      gap: theme.spacing.lg, // Increased gap for better proportion
      paddingHorizontal: theme.spacing.xl,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    segmentedControlWrapper: {
      flex: 4.2, // Slightly adjusted ratio for better balance with larger button
      height: 48 + theme.spacing.sm * 2, // Adjusted for padding
    },
    segmentedButtonWrapper: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative", // Allow absolute positioning of overlay
    },
  });
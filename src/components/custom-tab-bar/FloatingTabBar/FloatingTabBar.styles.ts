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
      paddingTop: theme.spacing.sm,
    },
    content: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      gap: theme.spacing.lg, // Increased gap for better proportion
      paddingHorizontal: theme.spacing.xl,
      // Enhanced shadow system for the entire tab bar
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
      height: 48,
    },
    segmentedButtonWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

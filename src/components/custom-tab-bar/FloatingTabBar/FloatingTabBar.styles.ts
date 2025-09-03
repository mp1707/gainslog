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
      width: "100%",
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
      height: 48,
    },
    segmentedButtonWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    background: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.lg, // Increased gap for better proportion
      borderRadius: 100,
      padding: theme.spacing.sm,
      overflow: "hidden",
    },
  });

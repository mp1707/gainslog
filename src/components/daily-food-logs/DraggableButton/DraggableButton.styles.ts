import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primaryText,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      height: 60,
      width: 60, // Perfect square for circular button
      borderRadius: 30, // Half of width/height for perfect circle
      zIndex: 999,
    },
    background: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 100,
      padding: theme.spacing.sm,
      overflow: "hidden",
    },
  });

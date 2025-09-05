import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: theme.spacing.xs,
      borderRadius: 8,
      padding: theme.spacing.xs,
      position: "relative",
    },
    containerDisabled: {
      opacity: 0.3,
    },
    containerSelected: {
      backgroundColor: colors.accent + "20", // 20% opacity
    },
    containerToday: {
      backgroundColor: colors.subtleBackground,
    },
    ringsContainer: {
      marginBottom: theme.spacing.xs / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      color: colors.primaryText,
      fontSize: 10,
      fontWeight: "600",
      textAlign: "center",
    },
    dayTextDisabled: {
      color: colors.disabledText,
    },
    dayTextSelected: {
      color: colors.accent,
      fontWeight: "700",
    },
    dayTextToday: {
      color: colors.accent,
      fontWeight: "700",
    },
  });
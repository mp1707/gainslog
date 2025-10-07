import { StyleSheet } from "react-native";

import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    barsContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    barTrack: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.subtleBackground,
      overflow: "hidden",
      position: "relative",
    },
    barTrackSpacing: {
      marginRight: theme.spacing.sm,
    },
    barFill: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
  });

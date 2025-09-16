import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 9999,
      padding: theme.spacing.sm,
      overflow: "hidden",
      zIndex: 99,
      position: "relative",
    },
    mediaActionContainer: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "flex-end",
    },
    waveformContainer: {
      height: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    waveformBar: {
      width: 4,
      borderRadius: 2,
      marginHorizontal: 1.5,
      backgroundColor: colors.secondaryText,
    },
  });

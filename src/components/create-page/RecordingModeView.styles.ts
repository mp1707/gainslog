import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
    },
    content: {
      flexDirection: "column",
      alignItems: "center",
      gap: theme.spacing.lg,
      width: "100%",
    },
    transcriptionContainer: {
      width: "100%",
      paddingVertical: theme.spacing.md,
      minHeight: 60,
    },
    transcriptionText: {
      textAlign: "center",
    },
    waveformRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.lg,
      width: "100%",
    },
    waveformContainer: {
      flex: 1,
    },
    waveform: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 100,
      overflow: "hidden",
      borderRadius: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    waveformBar: {
      width: 3,
      borderRadius: theme.spacing.xs,
      marginHorizontal: 2,
      backgroundColor: colors.accent,
    },
    stopButton: {},
  });

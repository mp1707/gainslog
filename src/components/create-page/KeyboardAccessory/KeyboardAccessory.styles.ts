import { StyleSheet } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.sm,
      minHeight: theme.spacing.xl + theme.spacing.lg,
      borderRadius: theme.spacing.xl,
      position: "relative",
    },
    layer: {
      ...StyleSheet.absoluteFillObject,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      justifyContent: "center",
    },
    actionsLayer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
      flex: 1,
    },
    waveformLayer: {
      justifyContent: "center",
    },
    waveformPanel: {
      alignSelf: "stretch",
      gap: theme.spacing.xs,
      alignItems: "flex-end",
    },
    waveformRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
    },
    waveformContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 42,
      flex: 1,
    },
    waveformBar: {
      width: 4,
      borderRadius: 2,
      marginHorizontal: 1.5,
      backgroundColor: colors.secondaryText,
    },
    waveformSubtitle: {
      color: colors.secondaryText,
      textAlign: "right",
    },
  });

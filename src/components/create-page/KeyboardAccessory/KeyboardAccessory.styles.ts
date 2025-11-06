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
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      borderRadius: theme.spacing.xl,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginLeft: "auto",
    },
    waveformContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      height: 28,
      overflow: "hidden",
      borderRadius: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    waveformBar: {
      width: 3,
      borderRadius: theme.spacing.xs,
      marginHorizontal: 2,
      backgroundColor:
        colorScheme === "dark" ? colors.accent : colors.primaryText,
    },
  });

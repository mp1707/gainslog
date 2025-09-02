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
    },
    content: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
    },
    segmentedControlWrapper: {
      flex: 5,
      height: 48,
    },
    segmentedButtonWrapper: {
      flex: 1,
    },
  });

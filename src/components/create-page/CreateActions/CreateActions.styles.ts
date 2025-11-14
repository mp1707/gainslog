import { StyleSheet } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: theme.spacing.md,
    },
  });

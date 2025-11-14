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
      justifyContent: "center",
      gap: theme.spacing.md,
      borderRadius: theme.spacing.xl,
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
  });

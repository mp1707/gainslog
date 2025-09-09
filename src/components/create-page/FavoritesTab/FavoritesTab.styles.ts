import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    scrollView: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
  });
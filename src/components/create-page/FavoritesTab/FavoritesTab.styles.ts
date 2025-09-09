import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    scrollView: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
  });
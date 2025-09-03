import { Colors, Theme } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {},
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    headerButtonContainer: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    headerTitle: {
      color: colors.primaryText,
    },
  });

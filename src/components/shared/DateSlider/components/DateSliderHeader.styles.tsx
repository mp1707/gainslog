import { Colors, Theme } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {},
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    headerButtonContainer: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      height: 44,
    },
    headerTitle: {
      color: colors.primaryText,
    },
  });

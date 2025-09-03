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
    modalBackdrop: {
      flex: 1,
    },
    blurContainer: {
      flex: 1,
    },
    modalBackdropTouchable: {
      flex: 1,
      paddingTop: "40%",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.md,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  });

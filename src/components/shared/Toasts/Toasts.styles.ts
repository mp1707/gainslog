import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    toastWrapper: {
      // Container for toast with safe area margin
    },
    toastContainer: {
      marginHorizontal: theme?.spacing.md,
      padding: theme?.spacing.md,
      borderRadius: theme?.components.cards.cornerRadius,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      flexShrink: 0,
    },
    favoriteAddedContainer: {
      borderColor: colors.semantic.fat + "20",
    },
    favoriteRemovedContainer: {
      borderColor: colors?.border,
    },
    errorContainer: {
      borderColor: colors.error + "20",
      minHeight: 60,
    },
    iconContainer: {
      borderRadius: 20,
      padding: theme?.spacing.sm || 8,
      marginRight: theme?.spacing.md,
    },
    favoriteAddedIcon: {
      backgroundColor: colors.semantic.fat + "20",
    },
    favoriteRemovedIcon: {
      backgroundColor: colors?.subtleBackground,
    },
    errorIcon: {
      backgroundColor: colors.error + "20",
    },
    textContainer: {
      gap: 2,
    },
    primaryText: {
      fontFamily: "Nunito-SemiBold",
      fontSize: 15,
      fontWeight: "600",
    },
    secondaryText: {
      fontFamily: "Nunito-Regular",
      fontSize: 13,
      fontWeight: "400",
    },
    errorText: {
      fontFamily: "Nunito-SemiBold",
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 2,
    },
  });

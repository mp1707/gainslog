import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    blurContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    modalBackdropTouchable: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      ...theme.components.cards,
    },
  });
import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: theme.spacing.lg,
      left: theme.spacing.lg,
      width: 70,
      height: 70,
      justifyContent: "center",
      alignItems: "center",
    },
    stackedImage: {
      position: "absolute",
      width: 55,
      height: 55,
      borderRadius: 8,
    },
    placeholder: {
      width: 55,
      height: 55,
      borderRadius: 8,
      backgroundColor: colors.subtleBackground,
      borderWidth: 2,
      borderColor: colors.accent,
      borderStyle: "dashed",
    },
  });
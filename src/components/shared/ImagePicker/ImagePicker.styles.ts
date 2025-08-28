import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      height: 200,
      borderRadius: theme.components.cards.cornerRadius,
      marginVertical: theme.spacing.lg,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    placeholder: {
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      ...theme.typography.Subhead,
      color: colors.secondaryText,
      marginTop: theme.spacing.sm,
    },
    uploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    uploadingText: {
      ...theme.typography.Body,
      color: colors.white,
      fontWeight: "600",
    },
  });
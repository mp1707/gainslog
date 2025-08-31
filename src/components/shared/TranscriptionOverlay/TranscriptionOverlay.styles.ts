import { StyleSheet, Dimensions } from "react-native";
import { theme, type Colors } from "@/theme";

const { width, height } = Dimensions.get("window");

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width,
      height,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },

    contentContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
    },

    transcriptionContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      maxWidth: width - (theme.spacing.xl * 2),
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 5,
    },

    transcriptionText: {
      fontSize: theme.typography.Body.fontSize,
      fontFamily: theme.typography.Body.fontFamily,
      fontWeight: theme.typography.Body.fontWeight,
      color: colors.primaryText,
      textAlign: "center",
      lineHeight: theme.typography.Body.fontSize * 1.4,
    },

    placeholderText: {
      color: colors.secondaryText,
      fontStyle: "italic",
    },

    stopButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.recording,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "rgba(0, 0, 0, 0.3)",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },

    stopButtonPressed: {
      transform: [{ scale: 0.95 }],
      shadowRadius: 8,
      elevation: 6,
    },

    stopIcon: {
      color: colors.white,
    },

    instructionText: {
      fontSize: theme.typography.Caption.fontSize,
      fontFamily: theme.typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: theme.spacing.md,
      opacity: 0.8,
    },
  });
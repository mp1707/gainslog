import { StyleSheet } from "react-native";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors, colorScheme: "light" | "dark") =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      minHeight: 100,
      shadowColor: colorScheme === "light" ? "rgba(0, 0, 0, 0.1)" : "transparent",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: colorScheme === "light" ? 1 : 0,
      shadowRadius: 8,
      elevation: colorScheme === "light" ? 3 : 0,
    },
    selectedCard: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + "10", // 10% opacity accent background
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryBackground,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: 4,
      fontFamily: "Nunito_600SemiBold",
    },
    selectedTitle: {
      color: colors.accent,
    },
    description: {
      fontSize: 15,
      color: colors.secondaryText,
      lineHeight: 20,
      fontFamily: "Nunito_400Regular",
    },
    selectedDescription: {
      color: colors.primaryText,
    },
  });
import { StyleSheet } from "react-native";
import { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.secondaryBackground,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingBottom: 40,
      paddingHorizontal: 20,
      minHeight: 300,
    },

    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 24,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      fontFamily: "Nunito-Bold",
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: 40,
    },

    actionsContainer: {
      gap: 0,
    },

    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 20,
      marginHorizontal: -20,
    },

    actionIcon: {
      width: 48,
      height: 48,
      backgroundColor: colors.accent,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 20,
    },

    actionTextContainer: {
      flex: 1,
    },

    actionLabel: {
      fontSize: 17,
      fontWeight: "600",
      fontFamily: "Nunito-SemiBold",
      color: colors.primaryText,
      marginBottom: 2,
    },

    actionSubtitle: {
      fontSize: 15,
      fontWeight: "400",
      fontFamily: "Nunito-Regular",
      color: colors.secondaryText,
      lineHeight: 20,
    },
  });
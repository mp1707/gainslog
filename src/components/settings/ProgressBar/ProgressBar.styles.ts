import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, themeObj: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: themeObj.spacing.lg,
    },
    step: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 2,
      borderColor: colors.border,
    },
    stepCompleted: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    stepCurrent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      transform: [{ scale: 1.2 }],
      shadowColor: colors.accent,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
    connector: {
      flex: 1,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    connectorCompleted: {
      backgroundColor: colors.accent,
    },
  });
};
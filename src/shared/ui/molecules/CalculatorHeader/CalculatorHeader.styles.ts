import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, themeObj: Theme) => {
  return StyleSheet.create({
    header: {
      backgroundColor: colors.primaryBackground,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      paddingTop: themeObj.spacing.sm,
      paddingBottom: themeObj.spacing.md,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      marginBottom: themeObj.spacing.md,
    },
    spacer: {
      width: 60, // Balance the cancel button
    },
    progressContainer: {
      paddingHorizontal: themeObj.spacing.sm,
    },
  });
};
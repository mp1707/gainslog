import { StyleSheet } from "react-native";
import { Theme } from "@/theme";

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
  });
};

import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const createStyles = () => {
  const { spacing } = theme;

  return StyleSheet.create({
    flowArrowContainer: {
      alignItems: "center",
      paddingVertical: spacing.md,
    },
  });
};

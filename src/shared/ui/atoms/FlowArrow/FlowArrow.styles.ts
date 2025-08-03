import { StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export const createStyles = () => {
  const { theme } = useTheme();
  const { spacing } = theme;

  return StyleSheet.create({
    flowArrowContainer: {
      alignItems: "center",
      paddingVertical: spacing.md,
    },
  });
};

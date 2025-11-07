import { StyleSheet } from "react-native";
import type { useTheme } from "@/theme";

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

export const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    card: {
      borderWidth: 0,
    },
    container: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    radioContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      gap: spacing.xs / 2,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.xs,
    },
    factorBadge: {
      flexShrink: 0,
    },
    description: {
      lineHeight: 18,
    },
  });
};

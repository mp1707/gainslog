import { StyleSheet } from "react-native";
import type { useTheme } from "@/theme";

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

export const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    wrapper: {
      position: "relative",
      width: "100%",
    },
    card: {
      borderWidth: 0,
    },
    container: {
      flexDirection: "row",
      gap: spacing.lg,
    },
    radioContainer: {
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    radioOverlay: {
      position: "absolute",
      left: theme.spacing.lg,
      top: theme.spacing.md,
      bottom: theme.spacing.md,
      width: 24,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    radioGutter: {
      width: 24,
      flexShrink: 0,
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
    titleWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      flex: 1,
    },
    factorBadge: {
      flexShrink: 0,
    },
    description: {
      lineHeight: 18,
    },
  });
};

import { StyleSheet } from "react-native";
import type { Colors, ColorScheme, Theme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  hasImage: boolean,
  colorScheme: ColorScheme
) => {
  const componentStyles = theme.getComponentStyles(colorScheme);

  return StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
      gap: hasImage ? theme.spacing.md : theme.spacing.xl,
      marginHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    textInputContainer: {
      minHeight: 150,
      backgroundColor: componentStyles.cards.backgroundColor,
      borderRadius: componentStyles.cards.cornerRadius,
    },
  });
};

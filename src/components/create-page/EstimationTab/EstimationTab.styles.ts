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
      gap: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      // alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    textInputContainer: {
      // minHeight: 150,
      backgroundColor: colors.primaryBackground,
      borderRadius: componentStyles.cards.cornerRadius,
    },
    image: {
      alignSelf: "center",
      width: 150,
      height: 150,
      margin: -10,
    },
  });
};

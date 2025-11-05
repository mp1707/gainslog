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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    textInputField: {
      backgroundColor: colors.primaryBackground,
      borderRadius: componentStyles.cards.cornerRadius,
    },
    textInputContainer: {
      paddingBottom: 200,
    },
    image: {
      alignSelf: "center",
      width: 150,
      height: 150,
      margin: -10,
    },
  });
};

import { StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import type { ColorScheme, Theme } from "@/theme";

export const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  themeObj: Theme,
  colorScheme: ColorScheme
) => {
  const { spacing } = themeObj;
  const componentStyles = themeObj.getComponentStyles(colorScheme);

  return StyleSheet.create({
    container: {
      marginHorizontal: spacing.md,
      aspectRatio: 16 / 9,
      borderRadius: componentStyles.cards.cornerRadius,
      overflow: "hidden",
    },
    skeleton: {
      flex: 1,
      backgroundColor: colors.disabledBackground,
      borderRadius: componentStyles.cards.cornerRadius,
    },
    imageContainer: {
      flex: 1,
      borderRadius: componentStyles.cards.cornerRadius,
      ...componentStyles.cards,
    },
    image: {
      flex: 1,
      width: "100%",
      borderRadius: componentStyles.cards.cornerRadius,
    },
  });
};
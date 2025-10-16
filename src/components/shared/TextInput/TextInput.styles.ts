import { StyleSheet } from "react-native";
import type { Colors, Theme, ColorScheme } from "@/theme";

export const createStyles = (
  colors: Colors,
  theme: Theme,
  colorScheme: ColorScheme,
  isFocused: boolean,
  fontSize: string
) =>
  StyleSheet.create({
    outerContainer: {
      backgroundColor: "transparent",
    },
    focusBorder: {
      borderWidth: 2,
      borderColor: isFocused ? colors.accent : "transparent",
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colorScheme === "light" ? colors.tertiaryBackground : colors.secondaryBackground,
    },
    textInput: {
      flex: 1,
      backgroundColor: "transparent",
      color: colors.primaryText,
      padding: theme.spacing.md,
      textAlignVertical: "top",
      ...theme.typography[fontSize as keyof typeof theme.typography],
      borderWidth: 0,
    },
  });

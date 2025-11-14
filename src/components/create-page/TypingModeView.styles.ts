import { StyleSheet } from "react-native";
import type { ColorScheme, Colors, Theme } from "@/theme";

export const createStyles = (
  theme: Theme,
  colors: Colors,
  colorScheme: ColorScheme
) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.lg,
      flex: 1,
    },
    textInputContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    textInputField: {},
  });

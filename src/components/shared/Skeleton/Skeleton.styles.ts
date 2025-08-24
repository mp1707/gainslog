import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/providers/ThemeProvider";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      base: {
        backgroundColor: colors.disabledBackground,
        borderRadius: theme.spacing.sm,
      },
    })
  );

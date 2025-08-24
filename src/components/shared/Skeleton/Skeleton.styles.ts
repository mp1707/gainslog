import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/theme";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      base: {
        backgroundColor: colors.disabledBackground,
        borderRadius: theme.spacing.sm,
      },
    })
  );

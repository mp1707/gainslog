import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/theme";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      container: {
        gap: theme.spacing.md,
      },
    })
  );

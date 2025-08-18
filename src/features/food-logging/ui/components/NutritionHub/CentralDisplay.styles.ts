import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, percentageColor: string) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 150,
      height: 150,
    },
    currentValue: {
      color: colors.primaryText,
      textAlign: 'center',
    },
    targetInfo: {
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 2,
    },
    percentageText: {
      color: percentageColor,
      textAlign: 'center',
      fontWeight: '600',
      marginTop: theme.spacing.xs,
    },
  });
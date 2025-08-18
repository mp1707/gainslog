import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, size: number) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    ringsContainer: {
      position: 'relative',
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerContent: {
      position: 'absolute',
    },
  });
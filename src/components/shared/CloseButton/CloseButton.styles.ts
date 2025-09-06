import { StyleSheet } from "react-native";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors, size: number = 40) =>
  StyleSheet.create({
    button: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
    },
    buttonPressed: {
      backgroundColor: colors.disabledBackground,
    },
  });
import { StyleSheet } from "react-native";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });
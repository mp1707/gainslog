import { StyleSheet } from "react-native";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors, height: number, position: 'top' | 'bottom') =>
  StyleSheet.create({
    headerWrapper: {
      position: "absolute",
      top: position === 'top' ? 0 : undefined,
      bottom: position === 'bottom' ? 0 : undefined,
      left: 0,
      right: 0,
      height,
      zIndex: 2,
    },
    gradientOverlay: {
      position: "absolute",
      top: position === 'top' ? 0 : undefined,
      bottom: position === 'bottom' ? 0 : undefined,
      left: 0,
      right: 0,
      height,
      zIndex: 11,
    },
    blurContainer: {
      flex: 1,
    },
  });
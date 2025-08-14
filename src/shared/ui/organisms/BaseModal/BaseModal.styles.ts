import { StyleSheet } from "react-native";
import type { Colors } from "@/theme/theme";

export const createStyles = (colors: Colors) => {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    backdropTouchable: {
      flex: 1,
    },
    sheet: {
      // Background and radius will be defined by children (ModalContent)
      // This allows maximum flexibility for different modal types
    },
    bottomUnderlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 32, // spacing.xl
      backgroundColor: colors.primaryBackground,
    },
  });
};
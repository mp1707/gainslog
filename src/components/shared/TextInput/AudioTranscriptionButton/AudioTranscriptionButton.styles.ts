import { StyleSheet } from "react-native";
import { theme, type Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },

      // Button states
    buttonPressed: {
      backgroundColor: colors.recording,
      transform: [{ scale: 0.95 }],
    },

    // Recording state (pulsing animation handled by parent)
    recording: {
      backgroundColor: colors.recording,
    },

    icon: {
      color: colors.white,
    },
  });

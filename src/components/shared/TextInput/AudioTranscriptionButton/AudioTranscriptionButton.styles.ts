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
      position: "absolute",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    // Positioning variants
    multilinePosition: {
      bottom: theme.spacing.sm,
      right: theme.spacing.sm,
    },
    
    singleLinePosition: {
      right: theme.spacing.sm,
      top: theme.spacing.sm,
      // marginTop: -24, // Half of button height to center vertically
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
// Centralized theme system based on "Focused Motivation" design system
import { Appearance } from "react-native";

// Base spacing unit
const SPACING_UNIT = 8;

// Color palettes
const lightColors = {
  accent: "#6200EA",
  primaryBackground: "#F9F9F9",
  secondaryBackground: "#FFFFFF",
  primaryText: "#111111",
  secondaryText: "#8A8A8E",
  border: "#EAEAEA",
  white: "#FFFFFF",
  disabledBackground: "rgba(17, 17, 17, 0.1)",
  disabledText: "rgba(17, 17, 17, 0.4)",
  recording: "#FF3B30", // iOS system red for recording/stop states
  // Semantic colors for nutrition data visualization (v1.4.0 - Vibrancy Harmonized)
  semantic: {
    // Change: Brighter, more energetic green to match the accent's vibrancy.
    calories: "#00C853",
    // Change: More saturated, "digital" blue that feels more active and less corporate.
    protein: "#2962FF",
    // Change: Slightly adjusted for harmony with the new palette.
    carbs: "#FF6D00",
    // Change: Kept a strong yellow, ensuring it feels distinct from the new orange.
    fat: "#FDB813",
  },
  // Semantic badge colors with proper backgrounds and text
  semanticBadges: {
    calories: {
      background: "rgba(0, 200, 83, 0.15)",
      text: "#00C853",
    },
    protein: {
      background: "rgba(41, 98, 255, 0.15)",
      text: "#2962FF",
    },
    carbs: {
      background: "rgba(255, 109, 0, 0.15)",
      text: "#FF6D00",
    },
    fat: {
      background: "rgba(253, 184, 19, 0.15)",
      text: "#FDB813",
    },
  },
  // State colors - harmonized with the new vibrant palette
  // Change: Using a deep, clear red that fits the palette.
  error: "#D50000",
  errorBackground: "rgba(213, 0, 0, 0.1)",
  // Change: A vibrant amber that stands out clearly.
  warning: "#FFAB00",
  warningBackground: "rgba(255, 171, 0, 0.1)",
  // Change: A distinct teal/green for success messages, preventing confusion with the 'calories' green.
  success: "#00BFA5",
  successBackground: "rgba(0, 191, 165, 0.1)",
  // Icon badge colors
  iconBadge: {
    background: "rgba(98, 0, 234, 0.15)",
    iconColor: "#6200EA",
  },
} as const;

const darkColors = {
  accent: "#7C4DFF",
  primaryBackground: "#000000",
  secondaryBackground: "#1C1C1E",
  primaryText: "#F2F2F7",
  secondaryText: "#8D8D93",
  border: "#38383A",
  white: "#FFFFFF",
  disabledBackground: "rgba(242, 242, 247, 0.15)",
  disabledText: "rgba(242, 242, 247, 0.4)",
  recording: "#FF453A", // Lighter red for dark mode
  // Semantic colors for nutrition data visualization (v1.4.0 - Vibrancy Harmonized)
  semantic: {
    // Change: Brighter, more neon-like green for better pop on dark backgrounds.
    calories: "#69F0AE",
    // Change: A vivid light blue that pairs well with the accent.
    protein: "#40C4FF",
    // Change: Adjusted to a slightly more saturated light orange.
    carbs: "#FFAB40",
    // Change: A bright, clear yellow.
    fat: "#FFD740",
  },
  // Semantic badge colors with proper backgrounds and text
  semanticBadges: {
    calories: {
      background: "rgba(105, 240, 174, 0.15)",
      text: "#69F0AE",
    },
    protein: {
      background: "rgba(64, 196, 255, 0.15)",
      text: "#40C4FF",
    },
    carbs: {
      background: "rgba(255, 171, 64, 0.15)",
      text: "#FFAB40",
    },
    fat: {
      background: "rgba(255, 215, 64, 0.15)",
      text: "#FFD740",
    },
  },
  // State colors - optimized and harmonized for dark mode
  // Change: A clearer, more vibrant red for errors.
  error: "#FF5252",
  errorBackground: "rgba(255, 82, 82, 0.15)",
  // Change: Consistent amber color for warnings.
  warning: "#FFAB40",
  warningBackground: "rgba(255, 171, 64, 0.15)",
  // Change: A bright and friendly teal for success.
  success: "#64FFDA",
  successBackground: "rgba(100, 255, 218, 0.15)",
  // Icon badge colors
  iconBadge: {
    background: "rgba(124, 77, 255, 0.15)",
    iconColor: "#7C4DFF",
  },
} as const;

// Typography scale with Nunito font
const typography = {
  Title1: {
    fontFamily: "Nunito-Bold",
    fontSize: 28,
    fontWeight: "700" as const,
    useCase: "Main dashboard greeting",
  },
  Title2: {
    fontFamily: "Nunito-Bold",
    fontSize: 22,
    fontWeight: "700" as const,
    useCase: "Screen titles",
  },
  Headline: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 17,
    fontWeight: "600" as const,
    useCase: "Card titles, key metrics",
  },
  Body: {
    fontFamily: "Nunito-Regular",
    fontSize: 15,
    fontWeight: "400" as const,
    useCase: "Main text, descriptions",
  },
  Subhead: {
    fontFamily: "Nunito-Regular",
    fontSize: 15,
    fontWeight: "400" as const,
    useCase: "Secondary info, list items",
  },
  Caption: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    fontWeight: "400" as const,
    useCase: "Timestamps, small annotations",
  },
  Button: {
    fontFamily: "Nunito-Bold",
    fontSize: 17,
    fontWeight: "500" as const,
    useCase: "Button labels",
  },
} as const;

// Spacing system based on 8pt grid
const spacing = {
  unit: SPACING_UNIT,
  pageMargins: {
    horizontal: 20,
  },
  xs: SPACING_UNIT * 0.5, // 4
  sm: SPACING_UNIT, // 8
  md: SPACING_UNIT * 2, // 16
  lg: SPACING_UNIT * 3, // 24
  xl: SPACING_UNIT * 4, // 32
  xxl: SPACING_UNIT * 6, // 48
} as const;

// Component specifications
const components = {
  cards: {
    cornerRadius: 16,
    lightMode: {
      backgroundColor: lightColors.secondaryBackground,
      shadowColor: "rgba(0, 0, 0, 0.05)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    darkMode: {
      backgroundColor: darkColors.secondaryBackground,
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  buttons: {
    cornerRadius: 12,
    primary: {
      default: {
        backgroundColor: lightColors.accent,
        textColor: lightColors.white,
      },
      active: {
        backgroundColor: "#4527A0",
        textColor: lightColors.white,
      },
      disabled: {
        backgroundColor: lightColors.disabledBackground,
        textColor: lightColors.disabledText,
      },
    },
    secondary: {
      default: {
        backgroundColor: "transparent",
        textColor: lightColors.accent,
        borderWidth: 1.5,
        borderColor: lightColors.accent,
      },
      active: {
        backgroundColor: "rgba(98, 0, 234, 0.1)",
        textColor: lightColors.accent,
        borderWidth: 1.5,
        borderColor: lightColors.accent,
      },
      disabled: {
        backgroundColor: "transparent",
        textColor: lightColors.disabledText,
        borderWidth: 1.5,
        borderColor: lightColors.disabledBackground,
      },
    },
  },
  aiActionTargets: {
    height: 56,
    minWidth: 120,
    iconColor: {
      light: lightColors.secondaryBackground,
      dark: darkColors.primaryBackground,
    },
    iconSize: 24,
  },
  progressBars: {
    height: 8,
    cornerRadius: 4,
    lightMode: {
      trackColor: lightColors.disabledBackground,
      fillColor: lightColors.accent,
    },
    darkMode: {
      trackColor: darkColors.disabledBackground,
      fillColor: darkColors.accent,
    },
  },
} as const;

// Animation configurations
const animations = {
  defaultTransition: {
    duration: 300,
    easing: "easeOut",
  },
  motivationalMoments: {
    logSuccess: {
      duration: 500,
      easing: "bezier(0.25, 1, 0.5, 1)",
      haptics: {
        type: "impact",
        style: "light",
      },
    },
    goalCompletion: {
      shimmer: {
        duration: 1000,
        easing: "linear",
        gradient: [
          "transparent",
          "rgba(105, 240, 174, 0.4)", // Using the new vibrant dark mode green
          "transparent",
        ],
      },
    },
  },
} as const;

// Helper function to get current color scheme
const getColorScheme = () => {
  return Appearance.getColorScheme() || "light";
};

// Get colors based on current scheme
const getColors = (scheme?: "light" | "dark") => {
  const currentScheme = scheme || getColorScheme();
  return currentScheme === "dark" ? darkColors : lightColors;
};

// Get component styles based on current scheme
const getComponentStyles = (scheme?: "light" | "dark") => {
  const currentScheme = scheme || getColorScheme();
  return {
    ...components,
    cards: {
      ...components.cards,
      ...(currentScheme === "dark"
        ? components.cards.darkMode
        : components.cards.lightMode),
    },
    aiActionTargets: {
      ...components.aiActionTargets,
      iconColor: components.aiActionTargets.iconColor[currentScheme],
    },
    progressBars: {
      ...components.progressBars,
      ...(currentScheme === "dark"
        ? components.progressBars.darkMode
        : components.progressBars.lightMode),
    },
  };
};

// Main theme object
export const theme = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  typography,
  spacing,
  components,
  animations,
  // Helper functions
  getColors,
  getComponentStyles,
} as const;

export type Theme = typeof theme;
export type ColorScheme = "light" | "dark";
export type Colors = typeof lightColors | typeof darkColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;

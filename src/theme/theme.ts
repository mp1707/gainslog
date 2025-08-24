// Centralized theme system based on "Focused Motivation" design system
import { Appearance } from "react-native";

// Base spacing unit
const SPACING_UNIT = 8;

// Color palettes
const lightColors = {
  // Core UI Colors
  primaryBackground: "#F9F9F9",
  secondaryBackground: "#FFFFFF",
  primaryText: "#1A1A1A",
  secondaryText: "#8E8E93",
  border: "#EAEAEA",
  white: "#FFFFFF",
  disabledBackground: "rgba(26, 26, 26, 0.1)",
  disabledText: "rgba(26, 26, 26, 0.4)",

  // Main Accent & System Colors
  accent: "#6200EA", // A striking magenta for a bold accent
  recording: "#FF3D00",
  error: "#FF3D00",
  warning: "#FFAB00",
  success: "#00BFA5",

  // Semantic Colors for Nutrition Data
  semantic: {
    calories: "#2DCEC4", // A vibrant, clean teal
    protein: "#4F86F7", // A rich, popping blue
    carbs: "#FF6B6B", // A warm, energetic coral
    fat: "#FFC107", // A bright, saturated amber
  },

  // Semi-transparent colors for badges/backgrounds
  semanticBadges: {
    calories: {
      background: "rgba(45, 206, 196, 0.15)",
      text: "#2DCEC4",
    },
    protein: {
      background: "rgba(79, 134, 247, 0.15)",
      text: "#4F86F7",
    },
    carbs: {
      background: "rgba(255, 107, 107, 0.15)",
      text: "#FF6B6B",
    },
    fat: {
      background: "rgba(255, 193, 7, 0.15)",
      text: "#FFC107",
    },
  },

  // State background colors
  errorBackground: "rgba(255, 61, 0, 0.1)",
  warningBackground: "rgba(255, 171, 0, 0.1)",
  successBackground: "rgba(0, 191, 165, 0.1)",

  // Icon badge colors
  iconBadge: {
    background: "rgba(194, 24, 91, 0.15)",
    iconColor: "#C2185B",
  },

  // Confidence indicator colors
  confidence: {
    high: {
      background: "rgba(16, 185, 129, 0.15)",
      text: "#10b981",
    },
    medium: {
      background: "rgba(245, 158, 11, 0.15)",
      text: "#f59e0b",
    },
    low: {
      background: "rgba(239, 68, 68, 0.15)",
      text: "#ef4444",
    },
    uncertain: {
      background: "rgba(26, 26, 26, 0.1)",
      text: "#8E8E93",
    },
  },
} as const;

const darkColors = {
  // Core UI Colors
  primaryBackground: "#000000",
  secondaryBackground: "#1C1C1E",
  primaryText: "#F2F2F7",
  secondaryText: "#8D8D93",
  border: "#38383A",
  white: "#FFFFFF",
  disabledBackground: "rgba(242, 242, 247, 0.15)",
  disabledText: "rgba(242, 242, 247, 0.4)",

  // Main Accent & System Colors
  accent: "#7C4DFF", // A brighter magenta for dark mode
  recording: "#FF665A",
  error: "#FF665A",
  warning: "#FFD54F",
  success: "#4DF2DE",

  // Semantic Colors for Nutrition Data
  semantic: {
    calories: "#44EBD4",
    protein: "#6A9BFF",
    carbs: "#FF8A8A",
    fat: "#FFD740",
  },

  // Semi-transparent colors for badges/backgrounds
  semanticBadges: {
    calories: {
      background: "hsla(172, 80.70%, 59.40%, 0.15)",
      text: "#44EBD4",
    },
    protein: {
      background: "rgba(106, 155, 255, 0.15)",
      text: "#6A9BFF",
    },
    carbs: {
      background: "rgba(255, 138, 138, 0.15)",
      text: "#FF8A8A",
    },
    fat: {
      background: "rgba(255, 215, 64, 0.15)",
      text: "#FFD740",
    },
  },

  // State background colors
  errorBackground: "rgba(255, 102, 90, 0.15)",
  warningBackground: "rgba(255, 213, 79, 0.15)",
  successBackground: "rgba(77, 242, 222, 0.15)",

  // Icon badge colors
  iconBadge: {
    background: "rgba(240, 98, 146, 0.15)",
    iconColor: "#F06292",
  },

  // Confidence indicator colors
  confidence: {
    high: {
      background: "rgba(77, 242, 222, 0.15)",
      text: "#4DF2DE",
    },
    medium: {
      background: "rgba(255, 213, 79, 0.15)",
      text: "#FFD54F",
    },
    low: {
      background: "rgba(255, 102, 90, 0.15)",
      text: "#FF665A",
    },
    uncertain: {
      background: "rgba(242, 242, 247, 0.15)",
      text: "#8D8D93",
    },
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

// Centralized theme system based on "Focused Motivation" design system
import { Appearance } from 'react-native';

// Base spacing unit
const SPACING_UNIT = 8;

// Color palettes
const lightColors = {
  accent: '#6200EA',
  primaryBackground: '#F9F9F9',
  secondaryBackground: '#FFFFFF',
  primaryText: '#111111',
  secondaryText: '#8A8A8E',
  border: '#EAEAEA',
  white: '#FFFFFF',
  disabledBackground: 'rgba(17, 17, 17, 0.1)',
  disabledText: 'rgba(17, 17, 17, 0.4)',
  recording: '#FF3B30', // iOS system red for recording/stop states
  // Semantic colors for nutrition data visualization (WCAG AA compliant)
  semantic: {
    calories: '#6200EA', // Using accent color for calories
    protein: '#14B8A6', // Teal for protein
    carbs: '#3B82F6', // Blue for carbs
    fat: '#F59E0B', // Amber for fat
  },
  // Semantic badge colors with proper backgrounds and text
  semanticBadges: {
    calories: {
      background: 'rgba(98, 0, 234, 0.15)',
      text: '#6200EA',
    },
    protein: {
      background: 'rgba(20, 184, 166, 0.15)',
      text: '#14B8A6',
    },
    carbs: {
      background: 'rgba(59, 130, 246, 0.15)',
      text: '#3B82F6',
    },
    fat: {
      background: 'rgba(245, 158, 11, 0.15)',
      text: '#F59E0B',
    },
  },
  // State colors - modern, accessible variants
  error: '#D32F2F', // Deeper red for better contrast and modern feel
  errorBackground: 'rgba(211, 47, 47, 0.1)',
  warning: '#FF9800', // Bright orange for warnings, distinct from new teal fat color
  warningBackground: 'rgba(255, 152, 0, 0.1)',
  success: '#2E7D32', // Deeper green, distinct from calories color
  successBackground: 'rgba(46, 125, 50, 0.1)',
  // Icon badge colors
  iconBadge: {
    background: 'rgba(98, 0, 234, 0.15)', // Updated to match new accent color
    iconColor: '#6200EA',
  },
} as const; 

const darkColors = {
  accent: '#7C4DFF',
  primaryBackground: '#000000',
  secondaryBackground: '#1C1C1E',
  primaryText: '#F2F2F7',
  secondaryText: '#8D8D93',
  border: '#38383A',
  white: '#FFFFFF',
  disabledBackground: 'rgba(242, 242, 247, 0.15)',
  disabledText: 'rgba(242, 242, 247, 0.4)',
  recording: '#FF3B30', // iOS system red for recording/stop states
  // Semantic colors for nutrition data visualization (optimized for dark backgrounds)
  semantic: {
    calories: '#7C4DFF', // Using dark accent color for calories
    protein: '#5EEAD4', // Light teal for protein
    carbs: '#60A5FA', // Light blue for carbs
    fat: '#FCD34D', // Light amber for fat
  },
  // Semantic badge colors with proper backgrounds and text
  semanticBadges: {
    calories: {
      background: 'rgba(124, 77, 255, 0.15)',
      text: '#7C4DFF',
    },
    protein: {
      background: 'rgba(94, 234, 212, 0.15)',
      text: '#5EEAD4',
    },
    carbs: {
      background: 'rgba(96, 165, 250, 0.15)',
      text: '#60A5FA',
    },
    fat: {
      background: 'rgba(252, 211, 77, 0.15)',
      text: '#FCD34D',
    },
  },
  // State colors - optimized for dark mode
  error: '#F44336', // Lighter red for dark backgrounds with good contrast
  errorBackground: 'rgba(244, 67, 54, 0.15)',
  warning: '#FF9800', // Brighter orange for dark backgrounds
  warningBackground: 'rgba(255, 152, 0, 0.15)',
  success: '#4CAF50', // Lighter green for dark backgrounds, distinct from calories
  successBackground: 'rgba(76, 175, 80, 0.15)',
  // Icon badge colors
  iconBadge: {
    background: 'rgba(124, 77, 255, 0.15)', // Updated to match new accent color
    iconColor: '#7C4DFF',
  },
} as const;

// Typography scale with Nunito font
const typography = {
  Title1: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    useCase: 'Main dashboard greeting',
  },
  Title2: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    fontWeight: '700' as const,
    useCase: 'Screen titles',
  },
  Headline: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 17,
    fontWeight: '600' as const,
    useCase: 'Card titles, key metrics',
  },
  Body: {
    fontFamily: 'Nunito-Regular',
    fontSize: 17,
    fontWeight: '400' as const,
    useCase: 'Main text, descriptions',
  },
  Subhead: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    fontWeight: '400' as const,
    useCase: 'Secondary info, list items',
  },
  Caption: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    fontWeight: '400' as const,
    useCase: 'Timestamps, small annotations',
  },
  Button: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    fontWeight: '700' as const,
    useCase: 'Button labels',
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
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    darkMode: {
      backgroundColor: darkColors.secondaryBackground,
      shadowColor: 'transparent',
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
        backgroundColor: '#4527A0', // Darker variant of new accent color
        textColor: lightColors.white,
      },
      disabled: {
        backgroundColor: lightColors.disabledBackground,
        textColor: lightColors.disabledText,
      },
    },
    secondary: {
      default: {
        backgroundColor: 'transparent',
        textColor: lightColors.accent,
        borderWidth: 1.5,
        borderColor: lightColors.accent,
      },
      active: {
        backgroundColor: 'rgba(98, 0, 234, 0.1)', // Updated to match new accent color
        textColor: lightColors.accent,
        borderWidth: 1.5,
        borderColor: lightColors.accent,
      },
      disabled: {
        backgroundColor: 'transparent',
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
    easing: 'easeOut',
  },
  motivationalMoments: {
    logSuccess: {
      duration: 500,
      easing: 'bezier(0.25, 1, 0.5, 1)',
      haptics: {
        type: 'impact',
        style: 'light',
      },
    },
    goalCompletion: {
      shimmer: {
        duration: 1000,
        easing: 'linear',
        gradient: [
          'transparent',
          'rgba(98, 0, 234, 0.4)', // Updated to match new accent color
          'transparent',
        ],
      },
    },
  },
} as const;

// Helper function to get current color scheme
const getColorScheme = () => {
  return Appearance.getColorScheme() || 'light';
};

// Get colors based on current scheme
const getColors = (scheme?: 'light' | 'dark') => {
  const currentScheme = scheme || getColorScheme();
  return currentScheme === 'dark' ? darkColors : lightColors;
};

// Get component styles based on current scheme
const getComponentStyles = (scheme?: 'light' | 'dark') => {
  const currentScheme = scheme || getColorScheme();
  return {
    ...components,
    cards: {
      ...components.cards,
      ...(currentScheme === 'dark' ? components.cards.darkMode : components.cards.lightMode),
    },
    aiActionTargets: {
      ...components.aiActionTargets,
      iconColor: components.aiActionTargets.iconColor[currentScheme],
    },
    progressBars: {
      ...components.progressBars,
      ...(currentScheme === 'dark' ? components.progressBars.darkMode : components.progressBars.lightMode),
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
export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors | typeof darkColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
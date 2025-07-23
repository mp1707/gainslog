import { TextStyle } from 'react-native';

export const typography = {
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 34,
  },

  // Font weights
  weights: {
    light: '300' as TextStyle['fontWeight'],
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  // Line heights
  lineHeights: {
    tight: 18,
    normal: 24,
    relaxed: 28,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: -0.2,
    wide: 0,
  },

  // Common text styles
  styles: {
    title: {
      fontSize: 34,
      fontWeight: '700' as TextStyle['fontWeight'],
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    logTitle: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 14,
      lineHeight: 18,
      fontStyle: 'italic' as TextStyle['fontStyle'],
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    nutritionLabel: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
    },
    macroLabel: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
    },
    macroValue: {
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    confidence: {
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
    },
    buttonSmall: {
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
    },
    recordingTitle: {
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      letterSpacing: -0.5,
    },
    recordingTimer: {
      fontSize: 32,
      fontWeight: '300' as TextStyle['fontWeight'],
      fontFamily: 'monospace',
    },
  },
} as const;

export type Typography = typeof typography;
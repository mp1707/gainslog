import { TextStyle } from 'react-native';

export const typography = {
  // Font family - Pixel fonts with fallbacks
  fontFamily: {
    primary: 'Silkscreen',      // Primary pixel font
    secondary: 'PixelOperator', // Secondary pixel font
    mono: 'monospace',          // Monospace fallback
    system: 'System',           // System fallback
  },

  // Font sizes - Pixel-perfect sizing
  sizes: {
    xs: 10,
    sm: 12,
    base: 16,   // Base size from design system
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 34,
  },

  // Font weights - Limited for pixel fonts
  weights: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  // Line heights - Adjusted for pixel fonts
  lineHeights: {
    tight: 16,
    normal: 20,
    relaxed: 24,
  },

  // Letter spacing - Minimal for pixel fonts
  letterSpacing: {
    tight: -0.2,
    normal: 0,
    wide: 0.5,
  },

  // Font rendering for crisp pixels (web-specific, ignored on native)
  rendering: {
    fontSmoothing: 'none',
    webkitFontSmoothing: 'none',
    textRendering: 'optimizeSpeed',
  },

  // Common text styles with pixel font
  styles: {
    title: {
      fontSize: 32,
      fontWeight: '700' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      letterSpacing: 0,
      lineHeight: 40,
      color: '#E0E0E0',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#E0E0E0',
    },
    logTitle: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      letterSpacing: 0,
      color: '#E0E0E0',
    },
    description: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      lineHeight: 16,
      color: '#999999',
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#999999',
    },
    nutritionLabel: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#999999',
    },
    macroLabel: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#999999',
    },
    macroValue: {
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#E0E0E0',
    },
    confidence: {
      fontSize: 12,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#E0E0E0',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#E0E0E0',
    },
    buttonSmall: {
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#E0E0E0',
    },
    recordingTitle: {
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      letterSpacing: 0,
      color: '#E0E0E0',
    },
    recordingTimer: {
      fontSize: 32,
      fontWeight: '400' as TextStyle['fontWeight'],
      fontFamily: 'monospace', // Keep monospace for timer
      color: '#E0E0E0',
    },
    // Additional pixel-specific styles
    pixelHeading: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      letterSpacing: 0,
      color: '#E0E0E0',
    },
    pixelBody: {
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      lineHeight: 20,
      color: '#E0E0E0',
    },
    pixelCaption: {
      fontSize: 12,
      fontWeight: '400' as TextStyle['fontWeight'],
      fontFamily: 'Silkscreen',
      color: '#999999',
    },
  },

  // Text color shortcuts
  colors: {
    primary: '#E0E0E0',
    secondary: '#999999',
    disabled: '#707070',
  },
} as const;

export type Typography = typeof typography;
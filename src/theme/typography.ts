import { TextStyle, Platform } from 'react-native';

export const typography = {
  // Platform-specific font families
  fontFamilies: {
    system: Platform.select({
      ios: 'San Francisco',
      android: 'Roboto',
      default: 'System',
    }),
    
    monospace: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'monospace',
    }),
  },

  // Font size scale based on iOS typography guidelines
  fontSizes: {
    xs: 10,
    sm: 12, 
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 34,
    '6xl': 48,
  },

  // Font weight scale matching SF Pro weights
  fontWeights: {
    ultralight: '100' as TextStyle['fontWeight'],
    thin: '200' as TextStyle['fontWeight'], 
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    heavy: '800' as TextStyle['fontWeight'],
    black: '900' as TextStyle['fontWeight'],
  },

  // Line height ratios for optimal readability
  lineHeights: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4, 
    relaxed: 1.5,
    loose: 1.6,
  },

  // Letter spacing values for different text contexts
  letterSpacing: {
    tighter: -0.8,
    tight: -0.5,
    normal: -0.2,
    wide: 0,
    wider: 0.3,
  },

  // iOS-inspired text style definitions
  textStyles: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as TextStyle['fontWeight'],
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    
    title1: {
      fontSize: 28,
      fontWeight: '600' as TextStyle['fontWeight'], 
      lineHeight: 34,
      letterSpacing: -0.4,
    },
    
    title2: {
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    
    title3: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'], 
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    
    headline: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 22,
      letterSpacing: -0.1,
    },
    
    body: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 18,
      letterSpacing: -0.1,
    },
    
    callout: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'], 
      lineHeight: 18,
      letterSpacing: -0.1,
    },
    
    subheadline: {
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 16,
      letterSpacing: 0,
    },
    
    footnote: {
      fontSize: 10,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 14, 
      letterSpacing: 0,
    },
    
    caption: {
      fontSize: 10,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 12,
      letterSpacing: 0.2,
    }
  },

  // Button-specific text styles
  buttonTextStyles: {
    large: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
    },
    
    medium: {
      fontSize: 14,
      fontWeight: '600' as TextStyle['fontWeight'], 
      lineHeight: 20,
    },
    
    small: {
      fontSize: 12,
      fontWeight: '500' as TextStyle['fontWeight'],
      lineHeight: 16,
    }
  },

  // Legacy styles for backward compatibility
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
      fontFamily: Platform.select({
        ios: 'SF Mono',
        android: 'Roboto Mono',
        default: 'monospace',
      }),
    },
  },
} as const;

export type Typography = typeof typography;
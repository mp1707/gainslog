export const colors = {
  // Background colors - RetroPixel Dark
  background: {
    primary: '#181818',    // Dark primary background
    container: '#2B2B2B',  // Container background with texture
    nested: '#181818',     // Nested container background
    overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlay
  },

  // Text colors
  text: {
    primary: '#E0E0E0',    // Primary text
    secondary: '#999999',  // Secondary/label text
    disabled: '#707070',   // Disabled text
    white: '#FFFFFF',
  },

  // Border colors
  border: {
    primary: '#999999',    // Primary borders
    secondary: '#444444',  // Secondary borders (nested containers)
    light: '#444444',      // Light borders
    medium: '#999999',     // Medium borders
    dark: '#999999',       // Dark borders
  },

  // Gradient definitions (for icons and featured elements)
  gradients: {
    primaryWarm: {
      colors: ['#FADE28', '#F28D38', '#E7562F'],
      locations: [0, 0.5, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondaryCool: {
      colors: ['#A24CF1', '#5B86F9'],
      locations: [0, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accentVibrant: {
      colors: ['#7CF64A', '#4FF8D8'],
      locations: [0, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Utility colors
  utility: {
    disabledFill: '#4D4D4D',
    disabledText: '#707070',
  },

  // Brand colors (updated for retro theme)
  brand: {
    primary: '#E7562F',    // From primary warm gradient
    secondary: '#5B86F9',  // From secondary cool gradient
    danger: '#E7562F',     // Keep similar to primary
  },

  // Status colors (retro-styled)
  status: {
    success: '#7CF64A',    // From accent vibrant gradient
    warning: '#F28D38',    // From primary warm gradient
    error: '#E7562F',      // From primary warm gradient
    danger: '#E7562F',
  },

  // Confidence indicator colors (retro-styled)
  confidence: {
    low: {
      background: '#4D4D4D',
      text: '#E7562F',
    },
    medium: {
      background: '#4D4D4D',
      text: '#F28D38',
    },
    high: {
      background: '#4D4D4D',
      text: '#7CF64A',
    },
    loading: {
      background: '#4D4D4D',
      text: '#999999',
    },
  },

  // Button styles
  button: {
    primary: {
      background: 'transparent',
      border: '#999999',
      text: '#E0E0E0',
      hover: {
        background: '#333333',
        border: '#E0E0E0',
      },
      active: {
        background: '#181818',
      },
    },
    secondary: {
      background: 'transparent',
      border: '#444444',
      text: '#999999',
      hover: {
        background: '#2B2B2B',
        border: '#999999',
        text: '#E0E0E0',
      },
      active: {
        background: '#181818',
      },
    },
    disabled: {
      background: '#2B2B2B',
      border: '#4D4D4D',
      text: '#707070',
    },
  },

  // Icon colors
  icon: {
    featured: '#FADE28', // Start of primary warm gradient
    standard: '#E0E0E0',
    secondary: '#999999',
    disabled: '#4D4D4D',
  },

  // Input colors
  input: {
    background: '#181818',
    border: '#999999',
    text: '#E0E0E0',
    placeholder: '#707070',
    focus: {
      border: '#E0E0E0',
    },
  },

  // Skeleton loading colors
  skeleton: '#4D4D4D',

  // Macro display colors (retro-styled)
  macro: '#7CF64A', // From accent vibrant gradient

  // Nutrition progress bar colors (retro-styled)
  nutrition: {
    protein: '#7CF64A',    // Accent vibrant green
    carbs: '#5B86F9',      // Secondary cool blue
    fat: '#F28D38',        // Primary warm orange
    calories: '#A24CF1',   // Secondary cool purple
  },

  // Container texture overlay
  texture: {
    containerFill: 'rgba(0,0,0,0.3)', // For repeating diagonal pattern
    sliderFill: '#E0E0E0',           // For pixel grid pattern
  },
} as const;

export type Colors = typeof colors;
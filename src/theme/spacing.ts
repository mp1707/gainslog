export const spacing = {
  // Base 8pt spacing scale
  scale: {
    0: 0,
    1: 4,
    2: 8, 
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  // Golden ratio derived spacing for natural proportions
  golden: {
    ratio: 1.618,
    xs: 6,
    sm: 10,
    md: 16,
    lg: 26,
    xl: 42,
    '2xl': 68,
  },

  // Component-specific spacing
  component: {
    container: {
      padding: 16,
      margin: 0,
    },
    
    card: {
      padding: 20,
      margin: 12,
      gap: 16,
    },
    
    modal: {
      padding: 20,
      margin: 0,
      gap: 24,
    },
    
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    
    input: {
      padding: 12,
      margin: 12,
      gap: 8,
    },
    
    list: {
      itemGap: 12,
      sectionGap: 24,
      padding: 16,
    }
  },

  // Layout-level spacing definitions
  layout: {
    screenPadding: 16,
    sectionGap: 32,
    componentGap: 24,
    elementGap: 16,
    microGap: 8,
  },

  // Border radius system for consistent rounded corners
  radii: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
    
    // Component-specific radius values
    button: {
      small: 24,
      medium: 28, 
      large: 32,
      square: 8,
    },
    card: 16,
    modal: 20,
    input: 8,
    badge: 12,
    image: 8,
  },

  // Legacy compatibility - keeping original structure
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 64,

  padding: {
    container: 16,
    card: 20,
    modal: 20,
    button: 12,
    input: 12,
    small: 8,
    large: 24,
  },

  margin: {
    card: 12,
    section: 24,
    input: 24,
    small: 4,
    medium: 8,
    large: 16,
  },

  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
    button: 28,
  },

  gap: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },

  button: {
    small: {
      width: 48,
      height: 48,
      radius: 24,
    },
    medium: {
      width: 56,
      height: 56,
      radius: 28,
    },
    large: {
      width: 64,
      height: 64,
      radius: 32,
    },
  },

  input: {
    default: 44,
    multiline: 100,
  },
} as const;

export type Spacing = typeof spacing;
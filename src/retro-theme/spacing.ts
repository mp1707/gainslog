export const spacing = {
  // Base spacing scale - 8px grid system for pixel-perfect alignment
  xs: 4,
  sm: 8,
  md: 8,      // Base 8px unit
  lg: 16,
  xl: 16,     // Keep consistent with 8px multiples
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,

  // Common paddings - 8px grid aligned
  padding: {
    container: 16,
    card: 16,       // Simplified for pixel design
    modal: 16,
    button: 8,      // Reduced for pixel buttons
    input: 8,       // Consistent with button
    small: 8,
    large: 24,
  },

  // Common margins - 8px grid aligned
  margin: {
    card: 8,        // Reduced for tighter pixel layout
    section: 24,
    input: 16,      // Adjusted to 8px multiple
    small: 8,
    medium: 8,
    large: 16,
  },

  // Border radius - All set to 0 for pixel-perfect sharp edges
  radius: {
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    '2xl': 0,
    '3xl': 0,
    full: 0,        // No rounded buttons in pixel design
    button: 0,      // Sharp button edges
  },

  // Common gaps - 8px grid aligned
  gap: {
    xs: 4,
    sm: 8,
    md: 8,
    lg: 16,
    xl: 16,
  },

  // Button sizes - Sharp rectangular buttons
  button: {
    small: {
      width: 40,
      height: 40,
      radius: 0,      // Sharp edges
    },
    medium: {
      width: 48,
      height: 48,
      radius: 0,      // Sharp edges
    },
    large: {
      width: 56,
      height: 56,
      radius: 0,      // Sharp edges
    },
  },

  // Input heights - Adjusted for pixel design
  input: {
    default: 40,    // Adjusted to 8px multiple
    multiline: 96,  // Adjusted to 8px multiple
  },

  // Pixel-specific spacing
  pixel: {
    borderWidth: 1,         // Standard pixel border
    containerPadding: 8,    // Standard container padding
    itemSpacing: 8,         // Space between items
    sectionSpacing: 16,     // Space between sections
    textureSize: 4,         // Size for texture patterns
  },

  // Layout constants for pixel-perfect design
  layout: {
    headerHeight: 64,       // 8px multiple
    fabSize: 48,           // 8px multiple
    fabSpacing: 16,        // Space between FABs
    cardMinHeight: 80,     // Minimum card height
    progressBarHeight: 8,  // Pixel-perfect progress bars
  },
} as const;

export type Spacing = typeof spacing;
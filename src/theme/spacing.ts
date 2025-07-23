export const spacing = {
  // Base spacing scale
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

  // Common paddings
  padding: {
    container: 16,
    card: 20,
    modal: 20,
    button: 12,
    input: 12,
    small: 8,
    large: 24,
  },

  // Common margins
  margin: {
    card: 12,
    section: 24,
    input: 24,
    small: 4,
    medium: 8,
    large: 16,
  },

  // Border radius
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

  // Common gaps
  gap: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // Button sizes
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

  // Input heights
  input: {
    default: 44,
    multiline: 100,
  },
} as const;

export type Spacing = typeof spacing;
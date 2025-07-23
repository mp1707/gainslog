import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

// Re-export individual objects
export { colors, type Colors } from './colors';
export { typography, type Typography } from './typography';
export { spacing, type Spacing } from './spacing';

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
} as const;

export type Theme = typeof theme;
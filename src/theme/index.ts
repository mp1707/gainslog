import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { animations } from './animations';
import { icons } from './icons';
import { accessibility } from './accessibility';

// Re-export individual objects
export { colors, type Colors } from './colors';
export { typography, type Typography } from './typography';
export { spacing, type Spacing } from './spacing';
export { shadows, type Shadows } from './shadows';
export { animations, type Animations } from './animations';
export { icons, type Icons } from './icons';
export { accessibility, type Accessibility } from './accessibility';

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  icons,
  accessibility,
} as const;

export type Theme = typeof theme;
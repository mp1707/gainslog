import { StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows, accessibility } from '@/theme';

export const styles = StyleSheet.create({
  // Base input styles
  base: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400',
    color: colors.text.primary,
    minHeight: 44,
  },

  // Focus state
  focused: {
    borderColor: colors.border.focus,
    borderWidth: 2,
  },

  // Error state
  error: {
    borderColor: colors.border.error,
    backgroundColor: colors.functional?.error?.background || '#fef2f2',
    borderWidth: 1,
  },

  // Disabled state
  disabled: {
    backgroundColor: colors.surface.depressed,
    color: colors.text.tertiary,
    borderColor: colors.border.secondary,
  },

  // Multiline variant
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Placeholder text color (handled via placeholderTextColor prop)
  placeholder: {
    color: colors.text.tertiary,
  },
});
import { StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows, accessibility } from '@/theme';

export const styles = StyleSheet.create({
  // Base input styles
  base: {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: spacing.radii.input,
    paddingHorizontal: spacing.component.input.padding,
    paddingVertical: spacing.component.input.padding,
    fontSize: typography.textStyles.body.fontSize,
    fontWeight: typography.textStyles.body.fontWeight,
    lineHeight: typography.textStyles.body.lineHeight,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    minHeight: accessibility.touchTargets.minimum,
  },

  // Focus state
  focused: {
    borderColor: colors.border.focus,
    borderWidth: 2,
    ...shadows.elevation[1],
  },

  // Error state
  error: {
    borderColor: colors.border.error,
    backgroundColor: colors.functional.error.background,
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
    height: spacing.input.multiline,
    textAlignVertical: 'top',
    paddingTop: spacing.component.input.padding,
  },

  // Placeholder text color (handled via placeholderTextColor prop)
  placeholder: {
    color: colors.text.tertiary,
  },
});
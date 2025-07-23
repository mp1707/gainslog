import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.secondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.dark,
    borderRadius: spacing.radius.lg,
    paddingHorizontal: spacing.padding.input,
    paddingVertical: spacing.padding.input,
    fontSize: typography.sizes.lg,
    color: colors.text.tertiary,
    minHeight: spacing.input.default,
  },

  multiline: {
    height: spacing.input.multiline,
    textAlignVertical: 'top',
  },
});
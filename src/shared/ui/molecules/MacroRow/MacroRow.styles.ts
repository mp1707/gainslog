import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.padding.small,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },

  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },

  value: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.macro,
  },
});
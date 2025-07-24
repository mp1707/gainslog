import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.scale[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.divider,
  },

  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[1],
  },

  label: {
    ...typography.textStyles.subheadline,
    color: colors.text.secondary,
    fontFamily: typography.fontFamilies.system,
  },

  value: {
    ...typography.textStyles.callout,
    fontFamily: typography.fontFamilies.system,
  },

  // Nutrition-specific value colors
  caloriesValue: {
    color: colors.nutrition.calories.primary,
  },

  proteinValue: {
    color: colors.nutrition.protein.primary,
  },

  carbsValue: {
    color: colors.nutrition.carbohydrates.primary,
  },

  fatValue: {
    color: colors.nutrition.fat.primary,
  },
});
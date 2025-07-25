import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.layout.sectionGap,
  },

  title: {
    ...typography.textStyles.headline,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.scale[1],
  },

  subtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.layout.elementGap,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.layout.microGap,
  },

  inputGroup: {
    width: '48%',
    marginBottom: spacing.layout.elementGap,
  },

  label: {
    ...typography.textStyles.callout,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.scale[2],
  },

  // Nutrition-specific label colors
  caloriesLabel: {
    color: colors.nutrition.calories.primary,
  },

  proteinLabel: {
    color: colors.nutrition.protein.primary,
  },

  carbsLabel: {
    color: colors.nutrition.carbohydrates.primary,
  },

  fatLabel: {
    color: colors.nutrition.fat.primary,
  },
});
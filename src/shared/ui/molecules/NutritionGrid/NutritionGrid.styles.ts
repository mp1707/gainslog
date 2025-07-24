import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },

  inputGroup: {
    width: '48%',
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
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
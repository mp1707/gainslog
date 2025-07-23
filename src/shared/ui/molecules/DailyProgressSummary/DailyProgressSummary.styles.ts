import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  macroItem: {
    flex: 1,
    marginRight: 16,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
    minWidth: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  caloriesItem: {
    alignItems: 'flex-end',
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
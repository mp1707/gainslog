import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.text.primary,
  },
  disabledButtonText: {
    color: colors.text.secondary,
  },
  monthText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginHorizontal: spacing.xl,
    textAlign: 'center',
    minWidth: 150,
  },
});
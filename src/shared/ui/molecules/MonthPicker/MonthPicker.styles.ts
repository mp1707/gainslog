import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { typography, spacing } = theme;

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
    backgroundColor: colors.secondaryBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.primaryText,
  },
  disabledButtonText: {
    color: colors.secondaryText,
  },
  monthText: {
    fontSize: typography.Title2.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Headline.fontFamily,
    color: colors.primaryText,
    marginHorizontal: spacing.xl,
    textAlign: 'center',
    minWidth: 150,
  },
});
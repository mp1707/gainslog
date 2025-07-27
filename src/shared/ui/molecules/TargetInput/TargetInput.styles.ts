import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { typography, spacing } = theme;

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Headline.fontWeight,
    fontFamily: typography.Body.fontFamily,
    color: colors.primaryText,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  input: {
    flex: 1,
    minWidth: 80,
  },
  unit: {
    fontSize: typography.Body.fontSize,
    fontWeight: typography.Subhead.fontWeight,
    fontFamily: typography.Body.fontFamily,
    color: colors.secondaryText,
    marginLeft: spacing.sm,
  },
});
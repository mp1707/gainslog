import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { spacing, typography } = theme;

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.Body.fontSize,
    fontFamily: typography.Body.fontFamily,
    fontWeight: typography.Headline.fontWeight,
    color: colors.primaryText,
  },
  values: {
    fontSize: typography.Body.fontSize,
    fontFamily: typography.Body.fontFamily,
    fontWeight: typography.Subhead.fontWeight,
    color: colors.secondaryText,
  },
  track: {
    height: theme.components.progressBars.height,
    borderRadius: theme.components.progressBars.cornerRadius,
    marginBottom: spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: theme.components.progressBars.cornerRadius,
    minWidth: 2,
  },
  percentage: {
    fontSize: typography.Caption.fontSize,
    fontFamily: typography.Caption.fontFamily,
    color: colors.secondaryText,
    alignSelf: 'flex-end',
  },
});
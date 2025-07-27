import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.components.cards.cornerRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
  },
  buttonText: {
    fontSize: theme.typography.Headline.fontSize,
    fontWeight: theme.typography.Headline.fontWeight,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.accent,
  },
  valueBox: {
    minWidth: 56,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
  },
  valueText: {
    fontSize: theme.typography.Body.fontSize,
    fontWeight: theme.typography.Body.fontWeight,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.primaryText,
  },
  valueInput: {
    fontSize: theme.typography.Body.fontSize,
    fontWeight: theme.typography.Body.fontWeight,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.primaryText,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());

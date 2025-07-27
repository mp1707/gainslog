import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  container: {
    borderRadius: theme.components.cards.cornerRadius,
    padding: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...theme.components.cards.lightMode, // Apply card shadow styles
  },
  dateText: {
    fontSize: theme.typography.Title2.fontSize,
    fontWeight: theme.typography.Title2.fontWeight,
    fontFamily: theme.typography.Title2.fontFamily,
    color: colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.Subhead.fontSize,
    fontWeight: theme.typography.Subhead.fontWeight,
    fontFamily: theme.typography.Subhead.fontFamily,
  },
  value: {
    fontSize: theme.typography.Subhead.fontSize,
    fontWeight: theme.typography.Headline.fontWeight,
    fontFamily: theme.typography.Headline.fontFamily,
  },
  metColor: { 
    color: colors.accent,
  },
  notMetColor: {
    color: colors.secondaryText,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
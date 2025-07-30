import { StyleSheet } from 'react-native';
import { ColorScheme, theme } from '../../../../theme';

export const createStyles = (
  colors: any,
  colorScheme: ColorScheme
) => {
  const componentStyles = theme.getComponentStyles(colorScheme);
  const { typography, spacing } = theme;

  return StyleSheet.create({
    container: {
      borderRadius: theme.components.cards.cornerRadius,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
      ...componentStyles.cards,
    },
    selectedContainer: {
      borderColor: colors.accent,
      backgroundColor: colorScheme === 'light' 
        ? 'rgba(255, 122, 90, 0.05)' 
        : 'rgba(255, 122, 90, 0.1)',
    },
    content: {
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    iconContainer: {
      marginRight: spacing.md,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    selectedTitle: {
      color: colors.accent,
    },
    description: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      fontWeight: typography.Caption.fontWeight,
      color: colors.secondaryText,
      lineHeight: 16,
    },
    calorieContainer: {
      backgroundColor: colorScheme === 'light' 
        ? 'rgba(17, 17, 17, 0.05)' 
        : 'rgba(242, 242, 247, 0.05)',
      borderRadius: 8,
      padding: spacing.sm,
    },
    calorieRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs / 2,
    },
    calorieLabel: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      fontWeight: typography.Subhead.fontWeight,
      color: colors.secondaryText,
    },
    calorieValue: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    selectedCalorieValue: {
      color: colors.accent,
    },
  });
};
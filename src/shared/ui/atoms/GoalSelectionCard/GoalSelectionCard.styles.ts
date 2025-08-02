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
        ? 'rgba(138, 63, 252, 0.05)' 
        : 'rgba(158, 102, 255, 0.1)',
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
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    calorieContainer: {
      marginTop: spacing.sm,
    },
    calorieRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    calorieLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
    calorieValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    selectedCalorieValue: {
      color: colors.accent,
    },
  });
};
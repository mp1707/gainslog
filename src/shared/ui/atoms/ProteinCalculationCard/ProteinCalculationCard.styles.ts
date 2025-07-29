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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
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
      marginBottom: spacing.xs,
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
    proteinContainer: {
      alignItems: 'flex-end',
    },
    proteinValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    selectedProteinValue: {
      color: colors.accent,
    },
    proteinLabel: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      fontWeight: typography.Caption.fontWeight,
      color: colors.secondaryText,
      marginTop: 2,
    },
  });
};
import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    stickyContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      backgroundColor: 'transparent',
    },
    stickyEditorPill: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.md,
    },
    inlineLabel: {
      marginBottom: theme.spacing.xs,
      color: colors.secondaryText,
    },
    focusWrapper: {
      borderWidth: 2,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: 'transparent',
      marginBottom: theme.spacing.sm,
    },
    input: {
      minHeight: 44,
      padding: theme.spacing.md,
      color: colors.primaryText,
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      fontFamily: theme.typography.Headline.fontFamily,
      fontSize: theme.typography.Headline.fontSize,
    },
    inlineActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    flex1: {
      flex: 1,
    },
  });


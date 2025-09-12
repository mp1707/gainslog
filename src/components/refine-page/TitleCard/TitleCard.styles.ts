import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '@/theme';

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
      color: colors.secondaryText,
    },
    titleInputContainer: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
    },
    titleInput: {
      minHeight: 44,
    },
  });


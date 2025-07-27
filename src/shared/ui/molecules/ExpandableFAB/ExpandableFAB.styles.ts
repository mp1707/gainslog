import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => 
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      right: theme.spacing.pageMargins.horizontal,
      alignItems: 'center',
      zIndex: 1000,
    },

    backdrop: {
      position: 'absolute',
      top: -1000,
      left: -1000,
      right: -1000,
      bottom: -1000,
      backgroundColor: colors.primaryText,
      zIndex: -1,
    },

    backdropPressable: {
      flex: 1,
    },

    actionButtonsContainer: {
      position: 'absolute',
      bottom: theme.components.aiActionTargets.height + theme.spacing.md,
      alignItems: 'center',
    },

    actionButtonWrapper: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    actionButton: {
      backgroundColor: colors.accent,
      width: theme.components.aiActionTargets.height,
      height: theme.components.aiActionTargets.height,
      borderRadius: theme.components.aiActionTargets.height / 2, // Circular
      alignItems: 'center',
      justifyContent: 'center',
      // Light mode shadow (matches design system)
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },

    mainFab: {
      backgroundColor: colors.accent,
      width: theme.components.aiActionTargets.height,
      height: theme.components.aiActionTargets.height,
      borderRadius: theme.components.aiActionTargets.height / 2, // Circular
      alignItems: 'center',
      justifyContent: 'center',
      // Light mode shadow (matches design system)
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
  });
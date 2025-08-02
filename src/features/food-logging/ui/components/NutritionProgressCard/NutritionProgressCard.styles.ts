import { StyleSheet } from 'react-native';
import type { Colors, Theme } from '../../../../../theme';

export const createStyles = (colors: Colors, theme: Theme) => StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },

  caloriesSection: {
    alignItems: 'center',
  },

  caloriesTitle: {
    marginBottom: theme.spacing.sm,
  },

  caloriesContent: {
    width: '100%',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },

  caloriesText: {
    textAlign: 'center',
  },

  progressBarContainer: {
    width: '100%',
    height: theme.components.progressBars.height,
    backgroundColor: colors.disabledBackground,
    borderRadius: theme.components.progressBars.cornerRadius,
    overflow: 'hidden',
    position: 'relative',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: theme.components.progressBars.cornerRadius,
    minWidth: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: colors.accent,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    opacity: 0.3,
  },

  macrosSection: {
    gap: theme.spacing.sm,
  },

  macrosTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },

  macrosGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
});
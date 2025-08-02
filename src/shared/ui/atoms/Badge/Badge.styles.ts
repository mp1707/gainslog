import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const createStyles = (colors: any) => StyleSheet.create({
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 28, // Ensure proper touch target
  },

  text: {
    // Text styling is handled by AppText component
  },

  // Confidence levels using simplified color scheme
  high: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green background
  },

  good: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber background  
  },

  partial: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red background
  },

  uncertain: {
    backgroundColor: colors.disabledBackground,
  },

  loading: {
    backgroundColor: colors.disabledBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text colors
  highText: {
    color: '#10b981', // Green text
  },

  goodText: {
    color: '#f59e0b', // Amber text
  },

  partialText: {
    color: '#ef4444', // Red text
  },

  uncertainText: {
    color: colors.secondaryText,
  },

  loadingText: {
    color: colors.secondaryText,
  },

  // Semantic nutrient styles using theme system
  semanticCalories: {
    backgroundColor: colors.semanticBadges?.calories?.background || 'rgba(98, 0, 234, 0.15)',
  },

  semanticProtein: {
    backgroundColor: colors.semanticBadges?.protein?.background || 'rgba(20, 184, 166, 0.15)',
  },

  semanticCarbs: {
    backgroundColor: colors.semanticBadges?.carbs?.background || 'rgba(59, 130, 246, 0.15)',
  },

  semanticFat: {
    backgroundColor: colors.semanticBadges?.fat?.background || 'rgba(245, 158, 11, 0.15)',
  },

  // Semantic text colors using theme system
  semanticCaloriesText: {
    color: colors.semanticBadges?.calories?.text || colors.semantic?.calories || '#6200EA',
  },

  semanticProteinText: {
    color: colors.semanticBadges?.protein?.text || colors.semantic?.protein || '#14B8A6',
  },

  semanticCarbsText: {
    color: colors.semanticBadges?.carbs?.text || colors.semantic?.carbs || '#3B82F6',
  },

  semanticFatText: {
    color: colors.semanticBadges?.fat?.text || colors.semantic?.fat || '#F59E0B',
  },

  // Icon badge style using theme system
  iconBadge: {
    backgroundColor: colors.iconBadge?.background || 'rgba(98, 0, 234, 0.15)',
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
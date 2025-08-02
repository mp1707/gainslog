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

  // Semantic nutrient styles
  semanticCalories: {
    backgroundColor: colors.semantic?.calories ? `${colors.semantic.calories}26` : 'rgba(52, 199, 89, 0.15)', // 15% opacity
  },

  semanticProtein: {
    backgroundColor: colors.semantic?.protein ? `${colors.semantic.protein}26` : 'rgba(10, 132, 255, 0.15)', // 15% opacity
  },

  semanticCarbs: {
    backgroundColor: colors.semantic?.carbs ? `${colors.semantic.carbs}26` : 'rgba(255, 159, 10, 0.15)', // 15% opacity
  },

  semanticFat: {
    backgroundColor: colors.semantic?.fat ? `${colors.semantic.fat}26` : 'rgba(255, 214, 10, 0.15)', // 15% opacity
  },

  // Semantic text colors
  semanticCaloriesText: {
    color: colors.semantic?.calories || '#34C759',
  },

  semanticProteinText: {
    color: colors.semantic?.protein || '#0A84FF',
  },

  semanticCarbsText: {
    color: colors.semantic?.carbs || '#FF9F0A',
  },

  semanticFatText: {
    color: colors.semantic?.fat || '#FFD60A',
  },

  // Icon badge style
  iconBadge: {
    backgroundColor: `${colors.accent}26`, // 15% opacity of accent color
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
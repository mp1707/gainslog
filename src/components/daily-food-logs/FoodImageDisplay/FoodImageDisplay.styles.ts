import { StyleSheet } from 'react-native';
import { useThemedStyles } from '@/providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  // Image display
  imageContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },

  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.spacing.sm,
    backgroundColor: colors.secondaryBackground,
  },
}));
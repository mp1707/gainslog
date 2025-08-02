import { StyleSheet } from 'react-native';
import { useThemedStyles } from '@/providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  // Currently no additional styles needed for form fields container
  // Individual form components handle their own styling
  container: {
    // Reserved for future styling needs
  },
}));
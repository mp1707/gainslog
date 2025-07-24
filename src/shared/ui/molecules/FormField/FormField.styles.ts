import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },

  error: {
    fontSize: 12,
    color: colors.functional?.error?.foreground || '#dc2626',
    marginTop: 4,
  },
});
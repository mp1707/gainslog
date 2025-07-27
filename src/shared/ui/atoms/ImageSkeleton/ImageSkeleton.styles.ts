import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { spacing } = theme;

export const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: spacing.sm,
  },
  skeleton: {
    flex: 1,
    backgroundColor: colors.disabledBackground,
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.border,
    opacity: 0.8,
    width: '50%',
  },
});
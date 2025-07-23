import { StyleSheet } from 'react-native';
import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing['6xl'],
    right: spacing.padding.large,
    flexDirection: 'column',
    gap: spacing.lg,
    alignItems: 'flex-end',
  },
});
import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const colors = theme.getColors();
const { spacing } = theme;

export const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.disabledBackground,
    borderRadius: spacing.sm,
  },
});
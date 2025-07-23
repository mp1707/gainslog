import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  header: {
    paddingHorizontal: spacing.padding.large,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },

  title: {
    ...typography.styles.title,
    color: colors.text.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.padding.container,
    paddingBottom: 100, // Space for floating buttons
  },
});
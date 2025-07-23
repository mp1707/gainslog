import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.padding.card,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },

  title: {
    ...typography.styles.modalTitle,
    color: colors.text.primary,
  },

  cancelButton: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },

  saveButton: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.brand.primary,
  },

  saveButtonDisabled: {
    color: colors.text.tertiary,
  },

  content: {
    flex: 1,
    padding: spacing.padding.card,
  },

  imageContainer: {
    marginBottom: spacing.padding.card,
    alignItems: 'center',
  },

  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: spacing.radius.xl,
    backgroundColor: colors.border.light,
  },
});
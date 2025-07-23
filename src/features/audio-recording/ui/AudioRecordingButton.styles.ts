import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  recordButton: {
    // No positioning - handled by parent container
  },

  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.margin.large,
  },

  actionButton: {
    width: spacing.button.small.width,
    height: spacing.button.small.height,
    borderRadius: spacing.button.small.radius,
    backgroundColor: colors.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  actionButtonText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },

  sendButton: {
    backgroundColor: colors.audio.send,
    shadowColor: colors.audio.send,
    paddingHorizontal: spacing.xs,
  },

  sendButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },

  processingButton: {
    width: spacing.button.medium.width,
    height: spacing.button.medium.height,
    borderRadius: spacing.button.medium.radius,
    backgroundColor: colors.audio.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  processingContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.button.medium.radius,
  },

  processingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.white,
    marginTop: 2,
  },

  // Emergency reset styles
  emergencyResetContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  emergencyResetButton: {
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.padding.small,
    borderRadius: spacing.radius.lg,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  emergencyResetText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
});
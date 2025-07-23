import { StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.radius['3xl'],
    paddingHorizontal: spacing['5xl'],
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
    marginHorizontal: spacing['4xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  recordingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.audio.recording,
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.styles.recordingTitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  timer: {
    ...typography.styles.recordingTimer,
    color: colors.text.secondary,
    marginBottom: spacing['3xl'],
  },

  stopButton: {
    width: spacing.button.large.width,
    height: spacing.button.large.height,
    borderRadius: spacing.button.large.radius,
    backgroundColor: colors.audio.recording,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.audio.recording,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: spacing.xl,
  },

  stopButtonText: {
    fontSize: typography.sizes['3xl'],
    color: colors.text.white,
  },

  hint: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    fontWeight: typography.weights.normal,
    textAlign: 'center',
  },
});
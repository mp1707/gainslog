import { StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '@/theme';

export const styles = StyleSheet.create({
  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal container - for page sheet presentation
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },

  // Modal header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.component.modal.padding,
    paddingVertical: spacing.layout.elementGap,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.divider,
  },

  title: {
    ...typography.textStyles.title1,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
  },

  // Header buttons
  cancelButton: {
    ...typography.textStyles.headline,
    color: colors.text.secondary,
    fontFamily: typography.fontFamilies.system,
  },

  saveButton: {
    ...typography.textStyles.headline,
    color: colors.interactive.primary.default,
    fontFamily: typography.fontFamilies.system,
  },

  saveButtonDisabled: {
    color: colors.interactive.primary.disabled,
  },

  // Modal content
  content: {
    flex: 1,
    padding: spacing.component.modal.padding,
  },

  scrollContent: {
    gap: spacing.component.modal.gap,
  },

  // Form sections
  section: {
    marginBottom: spacing.layout.componentGap,
  },

  sectionTitle: {
    ...typography.textStyles.headline,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.layout.microGap,
  },

  // Image display
  imageContainer: {
    marginBottom: spacing.layout.componentGap,
    alignItems: 'center',
  },

  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: spacing.radii.image,
    backgroundColor: colors.surface.secondary,
  },

  // Input fields
  inputField: {
    marginBottom: spacing.layout.microGap,
  },

  inputLabel: {
    ...typography.textStyles.callout,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.scale[1],
  },
});
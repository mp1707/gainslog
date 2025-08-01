import { StyleSheet } from 'react-native';
import { useThemedStyles } from '../../../providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal container - for page sheet presentation
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },

  // Modal header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  title: {
    fontSize: theme.typography.Title2.fontSize,
    fontFamily: theme.typography.Title2.fontFamily,
    fontWeight: theme.typography.Title2.fontWeight,
    color: colors.primaryText,
  },

  // Header buttons
  cancelButton: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.secondaryText,
  },

  saveButton: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    color: colors.accent,
  },

  saveButtonDisabled: {
    color: colors.disabledText,
  },

  // Modal content
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },

  scrollContent: {
    gap: theme.spacing.md,
  },

  // Form sections
  section: {
    marginBottom: theme.spacing.lg,
  },

  sectionTitle: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    fontWeight: theme.typography.Headline.fontWeight,
    color: colors.primaryText,
    marginBottom: theme.spacing.sm,
  },

  // Image display
  imageContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },

  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.spacing.sm,
    backgroundColor: colors.secondaryBackground,
  },

  // Input fields
  inputField: {
    marginBottom: theme.spacing.sm,
  },

  inputLabel: {
    fontSize: theme.typography.Body.fontSize,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.primaryText,
    marginBottom: theme.spacing.xs,
  },

  // Error display
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.xs,
  },

  errorText: {
    fontSize: theme.typography.Body.fontSize,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.error,
    lineHeight: theme.typography.Body.fontSize * 1.4,
  },
}));
import { StyleSheet } from 'react-native';
import { useThemedStyles } from '../../../../providers/ThemeProvider';

export const useStyles = () => useThemedStyles((colors, theme) => StyleSheet.create({
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

  titleContainer: {
    alignItems: 'center',
  },

  stepIndicator: {
    fontSize: theme.typography.Caption.fontSize,
    fontFamily: theme.typography.Caption.fontFamily,
    color: colors.secondaryText,
    marginTop: 2,
  },

  headerSpacer: {
    width: 60, // Same width as cancel button to center title
  },

  // Modal content
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },

  scrollContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },

  // Input section
  inputSection: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 16,
    shadowColor: colors.primaryText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  stepperContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },

  inputHint: {
    fontSize: theme.typography.Caption.fontSize,
    fontFamily: theme.typography.Caption.fontFamily,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // Sex toggle
  sexToggle: {
    backgroundColor: colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },

  sexToggleText: {
    fontSize: theme.typography.Body.fontSize,
    fontFamily: theme.typography.Body.fontFamily,
    fontWeight: theme.typography.Body.fontWeight,
    color: colors.white,
  },

  // Methods section
  methodsSection: {
    marginBottom: theme.spacing.lg,
  },

  sectionTitle: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    fontWeight: theme.typography.Headline.fontWeight,
    color: colors.primaryText,
    marginBottom: theme.spacing.sm,
  },

  sectionSubtitle: {
    fontSize: theme.typography.Body.fontSize,
    fontFamily: theme.typography.Body.fontFamily,
    color: colors.secondaryText,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },

  // Navigation
  navigationContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  continueButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    gap: theme.spacing.sm,
  },

  continueButtonDisabled: {
    backgroundColor: colors.secondaryText + '20',
  },

  continueButtonText: {
    fontSize: theme.typography.Headline.fontSize,
    fontFamily: theme.typography.Headline.fontFamily,
    fontWeight: theme.typography.Headline.fontWeight,
    color: colors.white,
  },

  continueButtonTextDisabled: {
    color: colors.secondaryText,
  },

  // Footer
  footer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: colors.primaryText + '10', // 10% opacity
    borderRadius: 12,
  },

  footerNote: {
    fontSize: theme.typography.Caption.fontSize,
    fontFamily: theme.typography.Caption.fontFamily,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
}));
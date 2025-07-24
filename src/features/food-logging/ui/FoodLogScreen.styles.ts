import { StyleSheet } from "react-native";
import { colors, typography, spacing, shadows } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollView: {
    flex: 1,
    paddingTop: spacing.layout.microGap,
  },

  scrollContent: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingBottom: spacing.scale[24], // Extra bottom padding for FAB
    gap: spacing.component.list.sectionGap,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
  },

  emptyTitle: {
    ...typography.textStyles.title2,
    color: colors.text.secondary,
    fontFamily: typography.fontFamilies.system,
    textAlign: 'center',
    marginBottom: spacing.layout.microGap,
  },

  emptySubtitle: {
    ...typography.textStyles.body,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamilies.system,
    textAlign: 'center',
  },

  // Section headers
  sectionHeader: {
    ...typography.textStyles.title2,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.layout.elementGap,
  },

  // Food log list
  logsList: {
    gap: spacing.component.list.itemGap,
  },

  // Floating Action Button styles
  fabContainer: {
    position: "absolute",
    bottom: spacing.scale[8],
    right: spacing.scale[5],
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.layout.microGap,
  },

  fabButton: {
    backgroundColor: colors.interactive.primary.default,
    width: spacing.button.medium.width,
    height: spacing.button.medium.height,
    borderRadius: spacing.button.medium.radius,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.presets.button,
    shadowColor: colors.interactive.primary.default,
  },

  fabButtonSecondary: {
    backgroundColor: colors.interactive.secondary.default,
    shadowColor: colors.interactive.secondary.default,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

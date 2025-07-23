import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../../theme";

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
    marginBottom: spacing.md,
  },

  // Date Picker styles
  datePicker: {
    alignSelf: "flex-start",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.padding.container,
    paddingBottom: 100, // Space for floating buttons
  },

  // Floating Action Button styles
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  fabButton: {
    backgroundColor: colors.text.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  fabButtonSecondary: {
    backgroundColor: colors.brand.primary,
  },
});

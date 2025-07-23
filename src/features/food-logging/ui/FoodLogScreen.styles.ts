import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  header: {
    paddingVertical: spacing.md,
    paddingRight: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.medium,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },

  // Progress bars styles
  progressContainer: {
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
    gap: spacing.sm,
  },

  labelsColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 4,
  },

  barsColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 6,
    paddingBlock: 4,
  },

  valuesColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 4,
  },

  progressLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.secondary,
    minWidth: 50,
    textAlign: "right",
  },

  progressBar: {
    backgroundColor: colors.border.light,
    borderRadius: 2,
    height: 6,
    flex: 1,
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
    minWidth: 1,
  },

  progressValue: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "right",
    minWidth: 85,
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

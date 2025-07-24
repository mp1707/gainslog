import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  scrollView: {
    flex: 1,
    paddingTop: spacing.md,
  },

  scrollContent: {
    paddingHorizontal: spacing.md,
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

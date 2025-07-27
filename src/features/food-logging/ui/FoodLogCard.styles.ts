import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const createStyles = (colors: any) => StyleSheet.create({
  card: {
    // Card uses no additional styles since the Card component handles styling
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },

  titleContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },

  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },

  title: {
    flex: 1,
  },

  loadingTitle: {
    color: colors.disabledText,
    fontStyle: "italic",
  },

  description: {
    fontStyle: "italic",
  },

  rightSection: {
    alignItems: "flex-end",
    gap: theme.spacing.sm,
  },

  // Camera icon styling
  cameraIcon: {
    marginRight: theme.spacing.xs,
  },
});

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
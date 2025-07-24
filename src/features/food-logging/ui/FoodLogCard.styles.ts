import { StyleSheet } from "react-native";
import { colors, typography, spacing, shadows } from "../../../theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: spacing.radii.card,
    padding: spacing.component.card.padding,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.primary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.layout.elementGap,
  },

  titleContent: {
    flex: 1,
    marginRight: spacing.layout.elementGap,
  },

  title: {
    ...typography.textStyles.title3,
    color: colors.text.primary,
    fontFamily: typography.fontFamilies.system,
    marginBottom: spacing.scale[1],
  },

  loadingTitle: {
    color: colors.text.tertiary,
    fontStyle: "italic",
  },

  description: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    fontStyle: "italic",
    fontFamily: typography.fontFamilies.system,
  },

  rightSection: {
    alignItems: "flex-end",
    gap: spacing.scale[2],
  },

  // Camera icon styling
  cameraIcon: {
    marginRight: spacing.scale[1],
  },
});

import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: spacing.radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: "hidden",
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.brand.primary,
  },
  valueBox: {
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  valueInput: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    padding: 0,
    margin: 0,
  },
});

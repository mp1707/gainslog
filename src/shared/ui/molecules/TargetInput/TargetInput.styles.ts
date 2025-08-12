import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/providers/ThemeProvider";

export const styles = (() => {
  // Maintain the previous static API by generating once with current theme.
  // For fully dynamic theming, this file could export a hook like useStyles similar to others.
  // Here, we align to existing usage which imports a static styles object.
  let created: ReturnType<typeof StyleSheet.create> | undefined;
  return (created ||= useThemedStyles((colors, theme) =>
    StyleSheet.create({
      container: {
        marginBottom: theme.spacing.lg,
      },
      label: {
        fontSize: theme.typography.Body.fontSize,
        fontWeight: theme.typography.Headline.fontWeight,
        fontFamily: theme.typography.Body.fontFamily,
        color: colors.primaryText,
        marginBottom: theme.spacing.sm,
      },
      inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        maxWidth: 200,
      },
      input: {
        flex: 1,
        minWidth: 80,
      },
      unit: {
        fontSize: theme.typography.Body.fontSize,
        fontWeight: theme.typography.Subhead.fontWeight,
        fontFamily: theme.typography.Body.fontFamily,
        color: colors.secondaryText,
        marginLeft: theme.spacing.sm,
      },
    })
  ));
})();

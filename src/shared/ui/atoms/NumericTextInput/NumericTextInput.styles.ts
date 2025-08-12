import { StyleSheet } from "react-native";
import { theme } from "@/theme";

import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    // Container that acts like a TextInput
    container: {
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 44, // Minimum touch target
      justifyContent: "center",
    },

    // Disabled state
    disabled: {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.6,
    },

    // Text styling
    text: {
      fontSize: theme.typography.Body.fontSize,
      fontWeight: theme.typography.Body.fontWeight,
      fontFamily: theme.typography.Body.fontFamily,
    },

    // Value text (when there's a value)
    value: {
      color: colors.primaryText,
    },

    // Placeholder text (when empty)
    placeholder: {
      color: colors.secondaryText,
    },

    // Disabled text
    disabledText: {
      color: colors.disabledText,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());

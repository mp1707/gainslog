import { StyleSheet } from "react-native";
import { theme } from "@/theme";

import type { Colors } from "@/theme";

interface StyleOptions {
  large?: boolean;
  borderless?: boolean;
}

export const createStyles = (colors: Colors, options: StyleOptions = {}) => {
  const { large = false, borderless = false } = options;
  
  return StyleSheet.create({
    // Container that acts like a TextInput
    container: {
      backgroundColor: borderless ? 'transparent' : colors.secondaryBackground,
      borderWidth: borderless ? 0 : 1,
      borderColor: borderless ? 'transparent' : colors.border,
      borderRadius: borderless ? 0 : theme.spacing.sm,
      paddingHorizontal: large ? theme.spacing.sm : theme.spacing.md,
      paddingVertical: large ? theme.spacing.md : theme.spacing.sm,
      minHeight: 44, // Minimum touch target
      justifyContent: "center",
    },

    // Disabled state
    disabled: {
      backgroundColor: borderless ? 'transparent' : colors.disabledBackground,
      borderColor: borderless ? 'transparent' : colors.border,
      opacity: 0.6,
    },

    // Text styling
    text: large ? {
      fontSize: theme.typography.Title1.fontSize,
      fontWeight: theme.typography.Title1.fontWeight,
      fontFamily: theme.typography.Title1.fontFamily,
    } : {
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
};

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());

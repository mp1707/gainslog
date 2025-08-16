import { StyleSheet } from "react-native";
import { theme } from "@/theme";

import type { Colors } from "@/theme";

interface StyleOptions {
  large?: boolean;
  extraLarge?: boolean;
  borderless?: boolean;
}

export const createStyles = (colors: Colors, options: StyleOptions = {}) => {
  const { large = false, extraLarge = false, borderless = false } = options;
  
  try {
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
    text: extraLarge ? {
      fontSize: 36,
      fontWeight: theme.typography.Title1.fontWeight,
      fontFamily: theme.typography.Title1.fontFamily,
    } : large ? {
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
  } catch (error) {
    console.error("[NumericTextInput.styles] Error creating styles:", error);
    // Return fallback styles
    return StyleSheet.create({
      container: {
        backgroundColor: borderless ? 'transparent' : '#FFFFFF',
        borderWidth: borderless ? 0 : 1,
        borderColor: borderless ? 'transparent' : '#EAEAEA',
        borderRadius: borderless ? 0 : 8,
        paddingHorizontal: large ? 8 : 16,
        paddingVertical: large ? 16 : 8,
        minHeight: 44,
        justifyContent: "center",
      },
      disabled: {
        backgroundColor: borderless ? 'transparent' : '#F0F0F0',
        borderColor: borderless ? 'transparent' : '#EAEAEA',
        opacity: 0.6,
      },
      text: extraLarge ? {
        fontSize: 36,
        fontWeight: '700',
        fontFamily: 'Nunito-Bold',
      } : large ? {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Nunito-Bold',
      } : {
        fontSize: 17,
        fontWeight: '400',
        fontFamily: 'Nunito-Regular',
      },
      value: {
        color: '#111111',
      },
      placeholder: {
        color: '#8A8A8E',
      },
      disabledText: {
        color: '#999999',
      },
    });
  }
};

// Legacy export removed - was causing crashes due to static theme.getColors() call at module load time
// Components should use createStyles(colors, options) with ThemeProvider colors instead

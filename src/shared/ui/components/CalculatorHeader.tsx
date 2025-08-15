import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/providers";

interface CalculatorHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function CalculatorHeader({ title, description, children }: CalculatorHeaderProps) {
  const { colors, theme: themeObj } = useTheme();

  const styles = useMemo(() => {
    const { spacing, typography } = themeObj;

    return StyleSheet.create({
      textSection: {
        paddingTop: spacing.lg,
        gap: spacing.sm,
      },
      subtitle: {
        fontSize: typography.Title2.fontSize,
        fontFamily: typography.Title2.fontFamily,
        color: colors.primaryText,
        textAlign: "center",
      },
      description: {
        fontSize: typography.Body.fontSize,
        fontFamily: typography.Body.fontFamily,
        color: colors.secondaryText,
        textAlign: "center",
        lineHeight: 22,
      },
      childrenContainer: {
        marginTop: spacing.md,
        alignItems: "center",
      },
    });
  }, [colors, themeObj]);

  return (
    <View style={styles.textSection}>
      <Text style={styles.subtitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
}
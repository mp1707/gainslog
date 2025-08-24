import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme";

interface SettingCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  children,
  style,
}) => {
  const { colors, theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      backgroundColor: colors.secondaryBackground,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
    },
  });

  return (
    <View style={[styles.card, style]} accessible accessibilityRole="summary">
      {children}
    </View>
  );
};

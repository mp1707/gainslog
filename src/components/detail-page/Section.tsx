import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { theme } from "@/theme";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => {
  const { colors } = useTheme();
  const componentStyles = theme.getComponentStyles();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.secondaryText }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.body, { ...componentStyles.cards }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.Caption,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  body: {
    borderRadius: theme.components.cards.cornerRadius,
  },
});

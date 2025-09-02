import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

export default function Overview() {
  const { colors, theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.md,
    },
    title: {
      ...theme.typography.Title1,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      ...theme.typography.Body,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <Text style={styles.subtitle}>
        This is the Overview screen. Add your overview functionality here.
      </Text>
    </View>
  );
}

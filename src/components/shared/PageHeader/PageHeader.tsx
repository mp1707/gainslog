import React from "react";
import { View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./PageHeader.styles";

interface PageHeaderProps {
  children: React.ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.content}>{children}</View>
    </View>
  );
}

import React from "react";
import { View, ViewStyle } from "react-native";
import { Wand2 } from "lucide-react-native";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ConfidenceBadge.styles";

interface ConfidenceBadgeProps {
  style?: ViewStyle;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ style }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={[styles.container, style]}>
      <View
        style={styles.badge}
        accessibilityRole="text"
        accessibilityLabel="Refine estimate"
      >
        <Wand2 size={16} color={colors.accent} strokeWidth={2.5} />
        <AppText style={styles.text}>Improve estimate!</AppText>
      </View>
    </View>
  );
};

import React from "react";
import { View, ViewStyle } from "react-native";
import { Wand2 } from "lucide-react-native";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ConfidenceBadge.styles";

interface ConfidenceBadgeProps {
  style?: ViewStyle;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  // Static "refine estimate" badge using potential status colors
  const styleInfo = colors.logStatus.potential;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          { backgroundColor: styleInfo.background },
        ]}
        accessibilityRole="text"
        accessibilityLabel="Refine estimate"
      >
        <Wand2
          size={16}
          color={styleInfo.iconColor}
          strokeWidth={2.5}
        />
        <AppText style={[styles.text, { color: styleInfo.text }]}>
          Refine Estimate
        </AppText>
      </View>
    </View>
  );
};

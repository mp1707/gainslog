import React, { useEffect, useRef } from "react";
import { View, ViewStyle } from "react-native";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react-native";
import { AppText } from "@/components";
import { getConfidenceLevel } from "@/utils/getConfidenceLevel";
import { createStyles } from "./ConfidenceBadge.styles";

interface ConfidenceBadgeProps {
  estimationConfidence?: number;
  style?: ViewStyle;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  estimationConfidence,
  style,
}) => {
  const styles = createStyles();

  // Get confidence info from our utility
  const confidenceInfo = getConfidenceLevel(estimationConfidence);

  // Icon mapping based on confidence level
  const getIconAndLabel = (level: number) => {
    switch (level) {
      case 3: // high
        return { Icon: CheckCircle, label: "High Accuracy" };
      case 2: // medium
        return { Icon: AlertTriangle, label: "Medium Accuracy" };
      case 1: // low
        return { Icon: AlertCircle, label: "Low Accuracy" };
      default: // uncertain
        return { Icon: HelpCircle, label: "Uncertain" };
    }
  };

  const { Icon, label } = getIconAndLabel(confidenceInfo.confidenceLevel);

  // Don't render if no confidence value
  if (estimationConfidence === undefined) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          { backgroundColor: confidenceInfo.color.background },
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${label} estimation`}
      >
        <Icon
          size={20}
          color={confidenceInfo.color.text}
          fill={confidenceInfo.color.background}
          strokeWidth={2}
        />
        <AppText style={[styles.text, { color: confidenceInfo.color.text }]}>
          {label}
        </AppText>
      </View>
    </View>
  );
};

import React, { useEffect, useRef } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import {
  CheckCircleIcon,
  WarningIcon,
  WarningCircleIcon,
  QuestionIcon,
} from "phosphor-react-native";
import { AppText } from "@/components";
import { SkeletonPill } from "@/components/shared/SkeletonPill";
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
        return { Icon: CheckCircleIcon, label: "High Accuracy" };
      case 2: // medium
        return { Icon: WarningIcon, label: "Medium Accuracy" };
      case 1: // low
        return { Icon: WarningCircleIcon, label: "Low Accuracy" };
      default: // uncertain
        return { Icon: QuestionIcon, label: "Uncertain" };
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
        <Icon size={14} color={confidenceInfo.color.text} weight="fill" />
        <AppText style={[styles.text, { color: confidenceInfo.color.text }]}>
          {label}
        </AppText>
      </View>
    </View>
  );
};

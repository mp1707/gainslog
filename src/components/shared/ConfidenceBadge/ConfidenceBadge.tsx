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
  isLoading?: boolean;
  wasLoading?: boolean;
  style?: ViewStyle;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  estimationConfidence,
  isLoading,
  wasLoading,
  style,
}) => {
  const styles = createStyles();

  // Track previous loading state to detect completion
  const previousLoadingRef = useRef(wasLoading);

  // Animation values for reveal
  const opacity = useSharedValue(isLoading ? 0 : 1);

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

  useEffect(() => {
    const wasLoadingPreviously = previousLoadingRef.current;

    if (!isLoading && wasLoadingPreviously) {
      // Animate reveal with 300ms delay to match LogCard timing
      opacity.value = withDelay(
        300,
        withSpring(1, { stiffness: 400, damping: 30 })
      );
    } else if (!isLoading && !wasLoadingPreviously) {
      // Show immediately if not coming from loading state
      opacity.value = 1;
    } else if (isLoading) {
      // Hide during loading
      opacity.value = 0;
    }

    previousLoadingRef.current = isLoading;
  }, [isLoading, wasLoading]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        scale: 0.95 + opacity.value * 0.05,
      },
    ],
  }));

  // Don't render if no confidence value and not loading
  if (estimationConfidence === undefined && !isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <SkeletonPill width={80} height={28} />
      ) : (
        <Animated.View style={animatedStyle}>
          <View
            style={[
              styles.badge,
              { backgroundColor: confidenceInfo.color.background },
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${label} estimation`}
          >
            <Icon size={14} color={confidenceInfo.color.text} weight="fill" />
            <AppText
              style={[styles.text, { color: confidenceInfo.color.text }]}
            >
              {label}
            </AppText>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

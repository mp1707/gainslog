import React from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Sparkles } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";

interface RefinementInfoProps {
  refinementText: string;
  animated?: boolean;
  animatedStyle?: any;
  style?: any;
}

export const RefinementInfo: React.FC<RefinementInfoProps> = ({
  refinementText,
  animated = false,
  animatedStyle,
  style,
}) => {
  const { colors } = useTheme();

  const content = (
    <View
      style={style}
      accessibilityRole="text"
      accessibilityLabel="Refine estimate"
    >
      <Sparkles
        size={16}
        color={colors.disabledText}
        strokeWidth={2}
      />
      <AppText role="Caption">{refinementText}</AppText>
    </View>
  );

  if (animated && animatedStyle) {
    return (
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    );
  }

  return content;
};
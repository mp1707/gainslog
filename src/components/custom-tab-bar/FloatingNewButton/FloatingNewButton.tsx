import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./FloatingNewButton.styles";

interface FloatingNewButtonProps {
  onPress: () => void;
}

export const FloatingNewButton: React.FC<FloatingNewButtonProps> = ({
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const pressProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(
          interpolate(pressProgress.value, [0, 1], [1, 0.9]),
          {
            damping: 15,
            stiffness: 400,
          }
        ),
      },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      style={styles.container}
      onPressIn={() => {
        pressProgress.value = 1;
      }}
      onPressOut={() => {
        pressProgress.value = 0;
      }}
      onPress={handlePress}
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Plus
          color={colors.white}
          size={24}
          strokeWidth={2.5}
        />
      </Animated.View>
    </Pressable>
  );
};
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

interface DotProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export const DotProgressIndicator: React.FC<DotProgressIndicatorProps> = ({
  currentPage,
  totalPages,
}) => {
  const { colors } = useTheme();

  const dots = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <View style={styles.container}>
      {dots.map((index) => (
        <Dot
          key={index}
          isActive={index === currentPage}
          activeColor={colors.accent}
          inactiveColor={colors.subtleBackground}
        />
      ))}
    </View>
  );
};

interface DotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

const Dot: React.FC<DotProps> = ({ isActive, activeColor, inactiveColor }) => {
  const scale = useSharedValue(isActive ? 1 : 0.7);
  const opacity = useSharedValue(isActive ? 1 : 0.5);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.7, {
      damping: 20,
      stiffness: 300,
    });
    opacity.value = withSpring(isActive ? 1 : 0.5, {
      damping: 20,
      stiffness: 300,
    });
  }, [isActive, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: isActive ? activeColor : inactiveColor,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

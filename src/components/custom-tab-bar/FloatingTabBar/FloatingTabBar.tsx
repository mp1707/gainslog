import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { createStyles } from "./FloatingTabBar.styles";
import { FloatingSegmentedControl } from "../FloatingSegmentedControl";
import { FloatingNewButton } from "../FloatingNewButton";
import { BlurredBackground } from "@/components/shared";

interface FloatingTabBarProps {
  selectedIndex: number;
  onSegmentChange: (index: number) => void;
  onNewPress: () => void;
  segments: string[];
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  selectedIndex,
  onSegmentChange,
  onNewPress,
  segments,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const insets = useSafeAreaInsets();

  const mountProgress = useSharedValue(0);

  useEffect(() => {
    // Subtle slide-up animation on mount
    mountProgress.value = withDelay(
      100,
      withSpring(1, {
        damping: 20,
        stiffness: 200,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: (1 - mountProgress.value) * 20,
        },
      ],
      opacity: mountProgress.value,
    };
  });

  return (
    <>
      <BlurredBackground
        position="bottom"
        height={85} // Slightly increased for better coverage
        intensity={5} // Enhanced blur for more premium feel
        opacity={0.5} // Increased opacity for better definition
      />
      <Animated.View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + theme.spacing.sm,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.segmentedControlWrapper}>
            <FloatingSegmentedControl
              selectedIndex={selectedIndex}
              onSegmentChange={onSegmentChange}
              segments={segments}
            />
          </View>
          <View style={styles.segmentedButtonWrapper}>
            <FloatingNewButton onPress={onNewPress} />
          </View>
        </View>
      </Animated.View>
    </>
  );
};

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  useAnimatedReaction,
  runOnJS, // Import runOnJS
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./CustomTabBar.styles";
import { SegmentedControl } from "../SegmentedControl";
import { DraggableButton } from "../DraggableButton";
import { DropZones } from "../DropZones";

interface CustomTabBarProps {
  selectedIndex: number;
  onSegmentChange: (index: number) => void;
  onNewPress: () => void;
  segments: string[];
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  selectedIndex,
  onSegmentChange,
  onNewPress,
  segments,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const insets = useSafeAreaInsets();

  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  const [isQuickActionsActive, setIsQuickActionsActive] = useState(false);

  const mountProgress = useSharedValue(0);
  const segmentedControlOpacity = useSharedValue(1);

  useEffect(() => {
    mountProgress.value = withDelay(
      100,
      withSpring(1, { damping: 20, stiffness: 200 })
    );
  }, []);

  useAnimatedReaction(
    () => isGestureActive.value,
    (isActive) => {
      // THE FIX: Wrap the state setter in runOnJS to safely call it from the UI thread.
      runOnJS(setIsQuickActionsActive)(isActive);
    },
    [] // Dependencies are automatically captured by the hook.
  );

  useEffect(() => {
    if (isQuickActionsActive) {
      segmentedControlOpacity.value = withTiming(0.2, { duration: 200 });
    } else {
      segmentedControlOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isQuickActionsActive]);

  const handleDragEnd = (targetZone: "camera" | "microphone" | null) => {
    if (targetZone === "camera") {
      console.log("camera started");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (targetZone === "microphone") {
      console.log("recording started");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleNewPress = () => {
    onNewPress();
  };

  const mountAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: (1 - mountProgress.value) * 20 }],
      opacity: mountProgress.value,
    };
  });

  const segmentedControlAnimatedStyle = useAnimatedStyle(() => ({
    opacity: segmentedControlOpacity.value,
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + theme.spacing.sm,
          },
          mountAnimatedStyle,
        ]}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.segmentedControlWrapper,
              segmentedControlAnimatedStyle,
            ]}
          >
            <SegmentedControl
              selectedIndex={selectedIndex}
              onSegmentChange={onSegmentChange}
              segments={segments}
            />
          </Animated.View>
          <View style={styles.segmentedButtonWrapper}>
            <DraggableButton
              onPress={handleNewPress}
              onDragEnd={handleDragEnd}
              gestureX={gestureX}
              gestureY={gestureY}
              isGestureActive={isGestureActive}
            />
          </View>
        </View>
      </Animated.View>

      <DropZones
        isVisible={isQuickActionsActive}
        isGestureActive={isGestureActive}
        gestureX={gestureX}
        gestureY={gestureY}
      />
    </>
  );
};

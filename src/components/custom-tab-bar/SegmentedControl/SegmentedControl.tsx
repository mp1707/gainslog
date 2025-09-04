import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./SegmentedControl.styles";
import { BlurView } from "expo-blur";

interface SegmentedControlProps {
  selectedIndex: number;
  onSegmentChange: (index: number) => void;
  segments: string[];
}

export const SegmentedControl: React.FC<
  SegmentedControlProps
> = ({ selectedIndex, onSegmentChange, segments }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const containerWidth = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const pressedIndex = useSharedValue(-1);

  const segmentWidths = useRef<number[]>([]);

  useEffect(() => {
    if (containerWidth.value > 0 && segmentWidths.current.length > 0) {
      const segmentWidth = segmentWidths.current[selectedIndex] || 0;
      const position =
        segmentWidths.current
          .slice(0, selectedIndex)
          .reduce((acc, width) => acc + width, 0) +
        theme.spacing.xs / 2; // Add container padding offset

      indicatorPosition.value = withSpring(position, {
        damping: 20,
        stiffness: 300,
      });
      indicatorWidth.value = withSpring(segmentWidth, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [selectedIndex, containerWidth.value]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
  };

  const handleSegmentLayout = (event: LayoutChangeEvent, index: number) => {
    segmentWidths.current[index] = event.nativeEvent.layout.width;

    // Update indicator position if this is the selected segment
    if (index === selectedIndex && containerWidth.value > 0) {
      const segmentWidth = event.nativeEvent.layout.width;
      const position =
        segmentWidths.current
          .slice(0, selectedIndex)
          .reduce((acc, width) => acc + width, 0) +
        theme.spacing.xs / 2; // Add container padding offset

      indicatorPosition.value = position;
      indicatorWidth.value = segmentWidth;
    }
  };

  const handleSegmentPress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSegmentChange(index);
    }
  };

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    width: indicatorWidth.value,
  }));

  const createSegmentPressStyle = (index: number) =>
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: withSpring(pressedIndex.value === index ? 0.95 : 1, {
            damping: 15,
            stiffness: 400,
          }),
        },
      ],
    }));

  return (
    <BlurView intensity={10} style={styles.background}>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <Animated.View
          style={[styles.selectionIndicator, indicatorAnimatedStyle]}
        />

        {segments.map((segment, index) => {
          const segmentPressStyle = createSegmentPressStyle(index);
          const isSelected = index === selectedIndex;

          return (
            <Pressable
              key={segment}
              style={styles.segment}
              onLayout={(event) => handleSegmentLayout(event, index)}
              onPressIn={() => {
                pressedIndex.value = index;
              }}
              onPressOut={() => {
                pressedIndex.value = -1;
              }}
              onPress={() => handleSegmentPress(index)}
            >
              <Animated.View style={segmentPressStyle}>
                <Text
                  style={[
                    styles.segmentText,
                    isSelected
                      ? styles.activeSegmentText
                      : styles.inactiveSegmentText,
                  ]}
                >
                  {segment}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
};
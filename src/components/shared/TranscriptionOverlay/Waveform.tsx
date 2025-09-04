import React, { useEffect, useRef } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

interface WaveFormProps {
  volumeLevel: number; // A number between 0 and 100
  isActive: boolean; // True when listening, false otherwise
}

// Configuration for the waveform
const BAR_COUNT = 45; // Number of bars in the waveform
const BAR_WIDTH = 4; // Width of each bar
const BAR_SPACING = 3; // Space between bars
const MAX_BAR_HEIGHT = 150; // Maximum height a bar can reach
const MIN_BAR_HEIGHT = 8; // Minimum height for a bar when active
const INACTIVE_BAR_HEIGHT = 4; // Height of bars when not active
const GLOW_COLOR = "#8A2BE2"; // Vibrant purple/blue glow
const ACTIVE_BAR_COLOR = "#9370DB"; // Medium purple
const INACTIVE_BAR_COLOR = "#4B0082"; // Darker purple for inactive bars

// Calculate total width needed for bars and spacing
const totalBarsWidth = BAR_COUNT * (BAR_WIDTH + BAR_SPACING);

const WaveForm: React.FC<WaveFormProps> = ({ volumeLevel, isActive }) => {
  // Shared values for each bar's height, initialized
  const barHeights = useRef(
    Array.from({ length: BAR_COUNT }, () => useSharedValue(INACTIVE_BAR_HEIGHT))
  ).current;

  // Shared value for the overall volume level, used to drive bar animations
  const animatedVolumeLevel = useSharedValue(0);

  // Shared value for the glow intensity
  const glowOpacity = useSharedValue(0);

  // Animate glow based on isActive prop
  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withTiming(0.8, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      glowOpacity.value = withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isActive]);

  useEffect(() => {
    // Update the shared value for the current volume level
    // This allows all bars to react to a single source of truth
    animatedVolumeLevel.value = volumeLevel;

    if (!isActive) {
      // If not active, smoothly reset all bars to their inactive state
      barHeights.forEach((heightSV) => {
        heightSV.value = withTiming(INACTIVE_BAR_HEIGHT, {
          duration: 400,
          easing: Easing.out(Easing.ease),
        });
      });
      cancelAnimation(animatedVolumeLevel); // Stop any ongoing volume-related animations
      return;
    }

    // When active, animate each bar
    barHeights.forEach((heightSV, index) => {
      // Calculate a base height based on the volume level,
      // ensuring a minimum height for visual presence.
      const baseHeight = interpolate(
        animatedVolumeLevel.value,
        [0, 100],
        [MIN_BAR_HEIGHT, MAX_BAR_HEIGHT],
        Extrapolate.CLAMP
      );

      // Introduce randomness and a central peak effect
      // Bars closer to the center will generally be taller and more reactive
      const center = Math.floor(BAR_COUNT / 2);
      const distanceFromCenter = Math.abs(index - center);
      const maxDistanceFromCenter = BAR_COUNT / 2;
      const reactivityFactor =
        1 - (distanceFromCenter / maxDistanceFromCenter) * 0.4; // Taper off reactivity

      // Add some subtle per-bar "noise" or offset for a more organic look
      const noise = (Math.random() * 0.4 + 0.6) * 0.5; // Random factor for variety
      const currentBarHeight = baseHeight * reactivityFactor * noise;

      // Animate the bar's height. Use withSpring for a more bouncy, natural feel,
      // or withTiming for a smoother, more controlled one. Let's go with withSpring for vibrancy.
      heightSV.value = withSpring(currentBarHeight, {
        damping: 15,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
      });
    });
  }, [volumeLevel, isActive]); // Re-run effect when volumeLevel or isActive changes

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowColor: GLOW_COLOR,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: interpolate(
        glowOpacity.value,
        [0, 1],
        [0, 20], // Glow radius from 0 to 20
        Extrapolate.CLAMP
      ),
      shadowOpacity: glowOpacity.value,
      elevation: interpolate(
        glowOpacity.value,
        [0, 1],
        [0, 20],
        Extrapolate.CLAMP
      ), // For Android
    };
  });

  return (
    <Animated.View style={[styles.waveformContainer, containerAnimatedStyle]}>
      {barHeights.map((heightSV, index) => {
        // Apply an animated style to each bar
        const barAnimatedStyle = useAnimatedStyle(() => {
          return {
            height: heightSV.value,
            backgroundColor: isActive ? ACTIVE_BAR_COLOR : INACTIVE_BAR_COLOR,
          };
        });

        return (
          <Animated.View key={index} style={[styles.bar, barAnimatedStyle]} />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  waveformContainer: {
    width: "100%",
    height: 300,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the bars horizontally
    overflow: "hidden", // Ensures glow doesn't extend infinitely, but also crops.
    // We'll manage glow via the container's shadow for a better look.
    paddingHorizontal: (screenWidth - totalBarsWidth) / 2, // Center bars dynamically
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2, // Rounded caps for the bars
    marginHorizontal: BAR_SPACING / 2, // Apply half spacing on each side
  },
});

export default WaveForm;

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Camera, Mic } from "lucide-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./DropZones.styles";
import { LinearGradient } from "expo-linear-gradient";

interface DropZonesProps {
  isVisible: boolean;
}

export const DropZones: React.FC<DropZonesProps> = ({ isVisible }) => {
  // Correctly destructure colorScheme from useTheme
  const { colors, theme, colorScheme } = useTheme();

  // Pass all required arguments to the createStyles function
  const { styles, dropZoneGradientColors, iconGlowGradientColors } =
    createStyles(colors, theme, colorScheme);

  const overlayOpacity = useSharedValue(0);
  const dropZoneScale = useSharedValue(0.95);

  useEffect(() => {
    if (isVisible) {
      overlayOpacity.value = withTiming(1, { duration: 150 });
      dropZoneScale.value = withSpring(1, {
        damping: 15,
        stiffness: 250,
        mass: 0.5,
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      dropZoneScale.value = withTiming(0.95, { duration: 200 });
    }
  }, [isVisible, overlayOpacity, dropZoneScale]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const dropZoneAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dropZoneScale.value }],
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      {/* The tint prop now correctly uses the colorScheme value */}
      <BlurView
        intensity={30}
        tint={colorScheme}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.dimOverlay} />

        <Animated.View
          style={[styles.dropZonesContainer, dropZoneAnimatedStyle]}
        >
          {/* Camera Drop Zone - Top */}
          <View style={styles.dropZone}>
            <LinearGradient
              colors={dropZoneGradientColors}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={iconGlowGradientColors}
                style={styles.iconGlow}
              />
              <Camera color={colors.primaryText} strokeWidth={2} size={48} />
            </View>
            <Text style={styles.dropZoneTitle}>Snap Meal</Text>
            <Text style={styles.dropZoneSubtitle}>
              Quickly capture a photo of your food
            </Text>
          </View>

          {/* Microphone Drop Zone - Bottom */}
          <View style={styles.dropZone}>
            <LinearGradient
              colors={dropZoneGradientColors}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={iconGlowGradientColors}
                style={styles.iconGlow}
              />
              <Mic color={colors.primaryText} strokeWidth={2} size={48} />
            </View>
            <Text style={styles.dropZoneTitle}>Record Log</Text>
            <Text style={styles.dropZoneSubtitle}>
              Describe your meal in a few seconds
            </Text>
          </View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

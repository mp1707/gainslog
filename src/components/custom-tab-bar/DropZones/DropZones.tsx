import React, { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
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

interface DropZonesProps {
  isVisible: boolean;
}

export const DropZones: React.FC<DropZonesProps> = ({ isVisible }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const overlayOpacity = useSharedValue(0);
  const dropZoneScale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      // Animate in with smooth timing
      overlayOpacity.value = withTiming(1, { duration: 200 });
      dropZoneScale.value = withSpring(1, { damping: 20, stiffness: 300 });
    } else {
      // Animate out quickly
      overlayOpacity.value = withTiming(0, { duration: 150 });
      dropZoneScale.value = withTiming(0.95, { duration: 150 });
    }
  }, [isVisible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const dropZoneAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: dropZoneScale.value,
      },
    ],
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      <BlurView intensity={20} style={styles.blurView}>
        <View style={styles.dimOverlay} />

        <Animated.View
          style={[styles.dropZonesContainer, dropZoneAnimatedStyle]}
        >
          {/* Camera Drop Zone - Top */}
          <View style={[styles.dropZone, styles.cameraZone]}>
            <View style={styles.iconContainer}>
              <Camera color={colors.black} strokeWidth={2} size={48} />
            </View>
            <Text style={styles.dropZoneTitle}>Take Image</Text>
            <Text style={styles.dropZoneSubtitle}>
              Drag here to capture photo
            </Text>
          </View>

          {/* Microphone Drop Zone - Bottom */}
          <View style={[styles.dropZone, styles.microphoneZone]}>
            <View style={styles.iconContainer}>
              <Mic color={colors.black} strokeWidth={2} size={48} />
            </View>
            <Text style={styles.dropZoneTitle}>Start Recording</Text>
            <Text style={styles.dropZoneSubtitle}>
              Drag here to record audio
            </Text>
          </View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

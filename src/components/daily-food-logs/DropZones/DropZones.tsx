import React, { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedRef,
  measure,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  SharedValue,
  withDelay,
  interpolateColor, // Import interpolateColor for background animation
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Camera, Mic } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components/shared/AppText";
import { createStyles } from "./DropZones.styles";
import * as Haptics from "expo-haptics";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { usePermissions } from "expo-media-library";
import { useCameraPermissions } from "expo-camera";

// --- New Prop for positioning (top/bottom item) ---
interface DropZoneItemProps {
  title: string;
  subtitle: string;
  IconComponent: React.FC<{
    size?: number;
    color?: string;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  }>;
  isGestureActive: SharedValue<boolean>;
  gestureX: SharedValue<number>;
  gestureY: SharedValue<number>;
  onActivate: () => void; // Action to perform on release
  position: "top" | "bottom"; // To apply correct border radius
}

const DropZoneItem: React.FC<DropZoneItemProps> = ({
  title,
  subtitle,
  IconComponent,
  isGestureActive,
  gestureX,
  gestureY,
  onActivate,
  position,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);

  const isActive = useSharedValue(false);
  const animatedRef = useAnimatedRef<View>();

  useAnimatedReaction(
    () => ({
      gx: gestureX.value,
      gy: gestureY.value,
      active: isGestureActive.value,
    }),
    (current, previous) => {
      if (current === null) return;

      // Check if gesture ended while active
      if (previous?.active && !current.active && isActive.value) {
        runOnJS(onActivate)();
      }

      if (!current.active) {
        if (isActive.value) isActive.value = false;
        return;
      }

      const measurements = measure(animatedRef);
      if (!measurements) return;

      const { pageX: x, pageY: y, width, height } = measurements;
      const isInside =
        current.gx >= x &&
        current.gx <= x + width &&
        current.gy >= y &&
        current.gy <= y + height;

      if (isInside && !isActive.value) {
        isActive.value = true;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      } else if (!isInside && isActive.value) {
        isActive.value = false;
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    []
  );

  // --- Refined Animation for iOS-style hover ---
  const itemAnimatedStyle = useAnimatedStyle(() => {
    // Determine background color based on active state for a subtle press effect
    const backgroundColor = interpolateColor(
      isActive.value ? 1 : 0,
      [0, 1],
      [styles.itemBackgroundColor.color, styles.itemActiveBackgroundColor.color]
    );

    return {
      backgroundColor,
      // Apply subtle scale on hover for physical feedback
      transform: [{ scale: withSpring(isActive.value ? 1.02 : 1) }],
    };
  });

  const positionStyle = position === "top" ? styles.topItem : styles.bottomItem;

  return (
    <Animated.View
      ref={animatedRef}
      style={[styles.dropZoneItem, positionStyle, itemAnimatedStyle]}
    >
      <View style={styles.iconContainer}>
        <IconComponent color={colors.primaryText} weight="light" size={24} />
      </View>
      <View style={styles.textContainer}>
        <AppText role="Headline" color="primary">
          {title}
        </AppText>
        <AppText role="Subhead" color="secondary" style={{ marginTop: 2 }}>
          {subtitle}
        </AppText>
      </View>
    </Animated.View>
  );
};

// --- Main DropZones Component ---
interface DropZonesProps {
  isVisible: boolean;
  isGestureActive: SharedValue<boolean>;
  gestureX: SharedValue<number>;
  gestureY: SharedValue<number>;
  onCameraActivate: () => void;
  onVoiceActivate: () => void;
}

export const DropZones: React.FC<DropZonesProps> = ({
  isVisible,
  isGestureActive,
  gestureX,
  gestureY,
  onCameraActivate,
  onVoiceActivate,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const { safeNavigate } = useNavigationGuard();

  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withSpring(isVisible ? 1 : 0, {
      damping: 18,
      stiffness: 250,
      mass: 0.7,
    });
  }, [isVisible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationProgress.value, [0, 0.5], [0, 1]),
      transform: [
        { scale: interpolate(animationProgress.value, [0, 1], [0.9, 1]) },
        // You could add a slight translation from bottom here if desired
        // { translateY: interpolate(animationProgress.value, [0, 1], [50, 0]) },
      ],
    };
  });

  const [medialibraryPermission, requestMediaLibraryPermission] =
    usePermissions();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  async function handleCameraDrop() {
    const allPermissions = await requestAllPermissions();
    if (allPermissions) {
      safeNavigate("/camera");
    }
  }

  async function requestAllPermissions() {
    const cameraStatus = await requestCameraPermission();
    if (!cameraStatus.granted) {
      Alert.alert("Error", "Camera permission is required.");
      return false;
    }
    const libraryStatus = await requestCameraPermission();
    if (!libraryStatus.granted) {
      Alert.alert("Error", "Camera permission is required.");
      return false;
    }
    return true;
  }

  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      <BlurView
        intensity={25}
        tint={colorScheme}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[styles.dropZonesContainer, containerAnimatedStyle]}
        >
          <View style={styles.actionGroupContainer}>
            <DropZoneItem
              title="Camera"
              subtitle="Snap your meal"
              IconComponent={Camera}
              isGestureActive={isGestureActive}
              gestureX={gestureX}
              gestureY={gestureY}
              onActivate={handleCameraDrop}
              position="top"
            />
            <View style={styles.divider} />
            <DropZoneItem
              title="Recording"
              subtitle="Describe your meal"
              IconComponent={Mic}
              isGestureActive={isGestureActive}
              gestureX={gestureX}
              gestureY={gestureY}
              onActivate={onVoiceActivate}
              position="bottom"
            />
          </View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

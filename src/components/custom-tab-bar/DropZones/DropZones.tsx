import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
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
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Camera, Mic } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components/shared/AppText";
import { createStyles } from "./DropZones.styles";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

// Define the new props required to track the user's gesture
interface DropZonesProps {
  isVisible: boolean;
  isGestureActive: SharedValue<boolean>;
  gestureX: SharedValue<number>;
  gestureY: SharedValue<number>;
}

// Add a new prop to handle the entry animation scale
interface DropZoneItemProps {
  title: string;
  subtitle: string;
  IconComponent: React.FC<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  isGestureActive: SharedValue<boolean>;
  gestureX: SharedValue<number>;
  gestureY: SharedValue<number>;
  entryScale: SharedValue<number>; // New prop
}

// A self-contained component for each drop zone.
const DropZoneItem: React.FC<DropZoneItemProps> = ({
  title,
  subtitle,
  IconComponent,
  isGestureActive,
  gestureX,
  gestureY,
  entryScale, // Accept the new prop
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const { styles, dropZoneGradientColors, iconGlowGradientColors } =
    createStyles(colors, theme, colorScheme);

  const isActive = useSharedValue(false);
  const animatedRef = useAnimatedRef<View>();

  useAnimatedReaction(
    () => {
      // We now depend on the shared values passed from the parent
      return {
        gx: gestureX.value,
        gy: gestureY.value,
        active: isGestureActive.value,
      };
    },
    (current) => {
      if (current === null) return;
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
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Soft);
      } else if (!isInside && isActive.value) {
        isActive.value = false;
      }
    },
    // The dependency array is empty because useAnimatedReaction automatically
    // subscribes to any shared values read inside its worklet.
    []
  );

  const containerStyle = useAnimatedStyle(() => {
    // Combine the entry scale and the hover scale into one value.
    const finalScale = entryScale.value * (isActive.value ? 1.05 : 1);
    return {
      // Apply a spring animation to the combined final scale.
      transform: [
        {
          scale: withSpring(finalScale, {
            damping: 15,
            stiffness: 250,
            mass: 0.5,
          }),
        },
      ],
      // Apply border when active
      borderWidth: withSpring(isActive.value ? 2 : 0, {
        damping: 15,
        stiffness: 250,
      }),
      borderColor: colors.accent,
    };
  });

  const iconContainerStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive.value ? 1.15 : 1, {
      damping: 10,
      stiffness: 300,
    });
    return {
      transform: [{ scale }],
    };
  });

  const iconGlowStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isActive.value ? 1 : 0.8);
    const scale = withSpring(isActive.value ? 1.1 : 1);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      ref={animatedRef}
      style={[
        styles.dropZone,
        containerStyle,
      ]}
    >
      <LinearGradient
        colors={dropZoneGradientColors}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
        <Animated.View
          style={[styles.iconGlow, { position: "absolute" }, iconGlowStyle]}
        >
          <LinearGradient
            colors={iconGlowGradientColors}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <IconComponent color={colors.primaryText} strokeWidth={1.5} size={48} />
      </Animated.View>
      <AppText
        role="Title2"
        color="primary"
        style={{ textAlign: "center", marginBottom: 4 }}
      >
        {title}
      </AppText>
      <AppText
        role="Body"
        color="secondary"
        style={{ textAlign: "center", maxWidth: "85%" }}
      >
        {subtitle}
      </AppText>
    </Animated.View>
  );
};

export const DropZones: React.FC<DropZonesProps> = ({
  isVisible,
  isGestureActive,
  gestureX,
  gestureY,
}) => {
  const { colorScheme } = useTheme();
  const { styles } = createStyles(
    useTheme().colors,
    useTheme().theme,
    colorScheme
  );

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
  }, [isVisible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    // When the overlay is not visible, it should not block any touches.
    pointerEvents: isVisible ? "auto" : "none",
  }));

  const dropZoneContainerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(overlayOpacity.value, [0.5, 1], [0, 1]),
  }));

  // The component is now always rendered, but its visibility and interactivity
  // are controlled by the `isVisible` prop driving the animations.
  return (
    <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
      <BlurView
        intensity={30}
        tint={colorScheme}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.dimOverlay} />
        <Animated.View
          style={[styles.dropZonesContainer, dropZoneContainerAnimatedStyle]}
        >
          <DropZoneItem
            title="Snap Meal"
            subtitle="Quickly capture a photo of your food"
            IconComponent={Camera}
            isGestureActive={isGestureActive}
            gestureX={gestureX}
            gestureY={gestureY}
            entryScale={dropZoneScale}
          />
          <DropZoneItem
            title="Record Log"
            subtitle="Describe your meal in a few seconds"
            IconComponent={Mic}
            isGestureActive={isGestureActive}
            gestureX={gestureX}
            gestureY={gestureY}
            entryScale={dropZoneScale}
          />
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

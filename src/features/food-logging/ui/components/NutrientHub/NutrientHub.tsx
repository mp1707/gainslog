import React from "react";
import { AccessibilityInfo, Dimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useDerivedValue,
  useAnimatedStyle,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { theme } from "@/theme";
import { LargeNutrientHub } from "./LargeNutrientHub";
import { CompactNutrientHub } from "./CompactNutrientHub";

// TypeScript interface for component props
interface NutrientValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutrientHubProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
  scrollY?: SharedValue<number>;
  onToggleToLarge?: () => void;
}

/**
 * NutrientHub - Simplified container that smoothly transitions between
 * LargeNutrientHub and CompactNutrientHub based on scroll position.
 */
export const NutrientHub: React.FC<NutrientHubProps> = ({
  percentages,
  targets,
  totals,
  scrollY,
  onToggleToLarge,
}) => {
  const compactModeValue = useSharedValue(0);
  const [reducedMotionEnabled, setReducedMotionEnabled] = React.useState(false);
  const [isManualToggleActive, setIsManualToggleActive] = React.useState(false);
  const manualToggleTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotionEnabled);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (manualToggleTimeoutRef.current) {
        clearTimeout(manualToggleTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to trigger haptic feedback - can be called from worklets via runOnJS
  const triggerHapticFeedback = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle manual toggle between compact and large modes
  const handleToggle = React.useCallback(() => {
    // Provide subtle haptic feedback for the resize action
    triggerHapticFeedback();

    // Clear any existing timeout
    if (manualToggleTimeoutRef.current) {
      clearTimeout(manualToggleTimeoutRef.current);
    }

    // Enable manual toggle mode
    setIsManualToggleActive(true);

    // Toggle the mode
    const currentValue = compactModeValue.value;
    const newValue = currentValue === 0 ? 1 : 0;
    
    // If transitioning from compact to large (1 -> 0), trigger scroll callback
    if (currentValue === 1 && newValue === 0 && onToggleToLarge) {
      onToggleToLarge();
    }
    
    compactModeValue.value = withSpring(newValue, {
      damping: reducedMotionEnabled ? 25 : 18,
      stiffness: reducedMotionEnabled ? 150 : 180,
      mass: 1.2,
    });

    // Re-enable scroll-based behavior after 3 seconds
    manualToggleTimeoutRef.current = setTimeout(() => {
      setIsManualToggleActive(false);
    }, 3000);
  }, [compactModeValue, reducedMotionEnabled, onToggleToLarge, triggerHapticFeedback]);

  // Simple scroll detection with hysteresis - only active when not manually toggled
  useDerivedValue(() => {
    if (!scrollY || isManualToggleActive) return;

    const scrollY_val = scrollY.value;

    if (scrollY_val > 100 && compactModeValue.value === 0) {
      // Transitioning to compact mode - provide haptic feedback
      runOnJS(triggerHapticFeedback)();
      compactModeValue.value = withSpring(1, {
        damping: reducedMotionEnabled ? 25 : 18,
        stiffness: reducedMotionEnabled ? 150 : 180,
        mass: 1.2,
      });
    } else if (scrollY_val < -40 && compactModeValue.value === 1) {
      // Transitioning to large mode - provide haptic feedback
      runOnJS(triggerHapticFeedback)();
      compactModeValue.value = withSpring(0, {
        damping: reducedMotionEnabled ? 25 : 18,
        stiffness: reducedMotionEnabled ? 150 : 180,
        mass: 1.2,
      });
    }
  });

  // Calculate heights for proper container sizing
  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - theme.spacing.pageMargins.horizontal * 2;
  const largeContainerSize = availableWidth;
  const compactContainerSize = availableWidth * 0.35;
  const compactHeight = compactContainerSize * 1.2;

  // Animated styles for smooth transitions
  const containerStyle = useAnimatedStyle(() => {
    const progress = compactModeValue.value;
    const height = largeContainerSize * (1 - progress) + compactHeight * progress;
    
    return {
      height,
      width: "100%",
      position: "relative" as const,
    };
  });

  const largeHubStyle = useAnimatedStyle(() => {
    const opacity = 1 - compactModeValue.value;
    return {
      opacity,
      width: "100%",
      position: "absolute" as const,
      top: 0,
      left: 0,
      zIndex: opacity > 0.5 ? 1 : 0,
    };
  });

  const compactHubStyle = useAnimatedStyle(() => {
    const opacity = compactModeValue.value;
    return {
      opacity,
      width: "100%",
      position: "absolute" as const,
      top: 0,
      left: 0,
      zIndex: opacity > 0.5 ? 1 : 0,
    };
  });

  return (
    <Pressable 
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel="Toggle nutrition view"
      accessibilityHint="Tap to switch between detailed and compact nutrition display"
    >
      <Animated.View style={containerStyle}>
        <Animated.View style={largeHubStyle}>
          <LargeNutrientHub
            percentages={percentages}
            targets={targets}
            totals={totals}
          />
        </Animated.View>
        <Animated.View style={compactHubStyle}>
          <CompactNutrientHub
            percentages={percentages}
            targets={targets}
            totals={totals}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

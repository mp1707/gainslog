import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  PlusIcon,
  PencilIcon,
  CameraIcon,
  ImageIcon,
  MicrophoneIcon,
  StarIcon,
} from "phosphor-react-native";
import { createStyles } from "./ExpandableFAB.styles";
import { useTheme } from "src/providers/ThemeProvider";

interface ExpandableFABProps {
  onManualLog: () => void;
  onCameraLog: () => void;
  onLibraryLog: () => void;
  onAudioLog: () => void;
  onFavoritesLog?: () => void;
  bottomOffset?: number;
}

interface ActionButton {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export const ExpandableFAB: React.FC<ExpandableFABProps> = ({
  onManualLog,
  onCameraLog,
  onLibraryLog,
  onAudioLog,
  onFavoritesLog,
  bottomOffset,
}) => {
  const { theme, colors, colorScheme } = useTheme();
  const componentStyles = theme.getComponentStyles(colorScheme);
  const styles = createStyles(colors, bottomOffset);
  const [isExpanded, setIsExpanded] = useState(false);

  const AnimatedTouchableOpacity = useMemo(
    () => Animated.createAnimatedComponent(TouchableOpacity),
    []
  );

  const iconColor = colors.white; // Align with design system: white icon on accent background in both modes

  // Animation values
  const expandAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);
  const backdropAnimation = useSharedValue(0);

  // Action buttons configuration
  const actionButtons: ActionButton[] = [
    {
      icon: (
        <PencilIcon
          size={componentStyles.aiActionTargets.iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      onPress: onManualLog,
      accessibilityLabel: "Manual food entry",
      accessibilityHint: "Opens manual food logging form",
    },
    {
      icon: (
        <CameraIcon
          size={componentStyles.aiActionTargets.iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      onPress: onCameraLog,
      accessibilityLabel: "Take photo",
      accessibilityHint: "Opens camera to photograph food",
    },
    {
      icon: (
        <ImageIcon
          size={componentStyles.aiActionTargets.iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      onPress: onLibraryLog,
      accessibilityLabel: "Choose from library",
      accessibilityHint: "Opens photo library to select food image",
    },
    {
      icon: (
        <MicrophoneIcon
          size={componentStyles.aiActionTargets.iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      onPress: onAudioLog,
      accessibilityLabel: "Record audio",
      accessibilityHint: "Opens audio recording for voice food logging",
    },
    {
      icon: (
        <StarIcon
          size={componentStyles.aiActionTargets.iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      onPress: onFavoritesLog || (() => {}),
      accessibilityLabel: "Choose favorite",
      accessibilityHint: "Open favorites to reuse a previous entry",
    },
  ];

  const toggleFAB = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);

    // Haptic feedback for state change
    Haptics.selectionAsync();

    // Animate expansion/collapse with improved spring physics
    expandAnimation.value = withSpring(newIsExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });

    // Animate icon rotation with more satisfying spring
    rotationAnimation.value = withSpring(newIsExpanded ? 1 : 0, {
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    });

    // Animate backdrop with slightly faster timing
    backdropAnimation.value = withTiming(newIsExpanded ? 1 : 0, {
      duration: 250,
    });
  };

  const handleActionPress = (action: () => void) => {
    // Light haptic feedback for action button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Close FAB first, then execute action
    setIsExpanded(false);
    expandAnimation.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
    rotationAnimation.value = withSpring(0, {
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    });
    backdropAnimation.value = withTiming(0, {
      duration: 250,
    });

    // Execute the action after a short delay for smooth animation
    setTimeout(action, 120);
  };

  // Main FAB animated styles
  const mainFabAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(rotationAnimation.value, [0, 1], [0, 45]);

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Press feedback: scale down and darken on press for both Action and Main FAB
  const createPressAnimatedStyle = (
    pressValue: SharedValue<number>,
    startColor: string,
    endColor: string
  ) =>
    useAnimatedStyle(() => {
      const scale = interpolate(pressValue.value, [0, 1], [1, 0.94], "clamp");
      const backgroundColor = interpolateColor(
        pressValue.value,
        [0, 1],
        [startColor, endColor]
      );
      return {
        transform: [{ scale }],
        backgroundColor,
      };
    });

  const usePressHandlers = (
    pressValue: SharedValue<number>
  ): { onPressIn: () => void; onPressOut: () => void } => {
    const onPressIn = () => {
      pressValue.value = withTiming(1, { duration: 110 });
    };
    const onPressOut = () => {
      pressValue.value = withSpring(0, {
        damping: 18,
        stiffness: 220,
        mass: 0.9,
      });
    };
    return { onPressIn, onPressOut };
  };

  // Reusable action button with press feedback
  const ActionButton: React.FC<{
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel: string;
    accessibilityHint: string;
  }> = ({ icon, onPress, accessibilityLabel, accessibilityHint }) => {
    const pressValue = useSharedValue(0);
    const animatedStyle = createPressAnimatedStyle(
      pressValue,
      colors.accent,
      theme.components.buttons.primary.active.backgroundColor
    );
    const { onPressIn, onPressOut } = usePressHandlers(pressValue);
    return (
      <AnimatedTouchableOpacity
        style={[styles.actionButton, animatedStyle]}
        onPress={() => handleActionPress(onPress)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {icon}
      </AnimatedTouchableOpacity>
    );
  };

  // Action button animated styles with true expanding effect
  const getActionButtonAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      // Compact spacing for thumb reach - 50px between buttons
      const buttonSpacing = 70;
      const buttonOffset = (index + 1) * buttonSpacing;

      // Scale animation - buttons start invisible and scale up
      const scale = interpolate(
        expandAnimation.value,
        [0, 0.2, 1],
        [0, 0.3, 1],
        "clamp"
      );

      // Opacity with staggered appearance for smooth cascade
      const delayFactor = index * 0.15; // Stagger each button
      const opacity = interpolate(
        expandAnimation.value,
        [delayFactor, delayFactor + 0.3, 1],
        [0, 0, 1],
        "clamp"
      );

      // True slide from FAB center (0,0) to final position
      const translateY = interpolate(
        expandAnimation.value,
        [0, 1],
        [0, -buttonOffset], // Slide from center to final position
        "clamp"
      );

      return {
        transform: [{ translateY }, { scale }],
        opacity,
      };
    });
  };

  // Backdrop animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropAnimation.value * 0.3,
    };
  });

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        pointerEvents={isExpanded ? "auto" : "none"}
      >
        <Pressable style={styles.backdropPressable} onPress={toggleFAB} />
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {actionButtons.map((button, index) => (
          <Animated.View
            key={index}
            style={[
              styles.actionButtonWrapper,
              getActionButtonAnimatedStyle(actionButtons.length - 1 - index), // Reverse order for bottom-up animation
            ]}
          >
            <ActionButton
              icon={button.icon}
              onPress={button.onPress}
              accessibilityLabel={button.accessibilityLabel}
              accessibilityHint={button.accessibilityHint}
            />
          </Animated.View>
        ))}
      </View>

      {/* Main FAB */}
      {(() => {
        const mainPress = useSharedValue(0);
        const mainPressStyle = createPressAnimatedStyle(
          mainPress,
          colors.accent,
          theme.components.buttons.primary.active.backgroundColor
        );
        const { onPressIn, onPressOut } = usePressHandlers(mainPress);
        return (
          <AnimatedTouchableOpacity
            style={[styles.mainFab, mainPressStyle]}
            onPress={() => {
              // Medium haptic feedback for main FAB press
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              toggleFAB();
            }}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              isExpanded
                ? "Close food logging options"
                : "Open food logging options"
            }
            accessibilityHint={
              isExpanded
                ? "Closes the food logging menu"
                : "Shows food logging options"
            }
            accessibilityState={{ expanded: isExpanded }}
          >
            <Animated.View style={mainFabAnimatedStyle}>
              <PlusIcon
                size={componentStyles.aiActionTargets.iconSize}
                color={iconColor}
                weight="bold"
              />
            </Animated.View>
          </AnimatedTouchableOpacity>
        );
      })()}
    </View>
  );
};

import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { PlusIcon, PencilIcon, CameraIcon, ImageIcon, MicrophoneIcon } from 'phosphor-react-native';
import { useTheme } from '../../../../providers/ThemeProvider';
import { createStyles } from './ExpandableFAB.styles';

interface ExpandableFABProps {
  onManualLog: () => void;
  onCameraLog: () => void;
  onLibraryLog: () => void;
  onAudioLog: () => void;
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
}) => {
  const { theme, colors } = useTheme();
  const styles = createStyles(colors);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values
  const expandAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);
  const backdropAnimation = useSharedValue(0);

  // Action buttons configuration
  const actionButtons: ActionButton[] = [
    {
      icon: <PencilIcon size={theme.components.aiActionTargets.iconSize} color={theme.components.aiActionTargets.iconColor} weight="regular" />,
      onPress: onManualLog,
      accessibilityLabel: "Manual food entry",
      accessibilityHint: "Opens manual food logging form"
    },
    {
      icon: <CameraIcon size={theme.components.aiActionTargets.iconSize} color={theme.components.aiActionTargets.iconColor} weight="regular" />,
      onPress: onCameraLog,
      accessibilityLabel: "Take photo",
      accessibilityHint: "Opens camera to photograph food"
    },
    {
      icon: <ImageIcon size={theme.components.aiActionTargets.iconSize} color={theme.components.aiActionTargets.iconColor} weight="regular" />,
      onPress: onLibraryLog,
      accessibilityLabel: "Choose from library",
      accessibilityHint: "Opens photo library to select food image"
    },
    {
      icon: <MicrophoneIcon size={theme.components.aiActionTargets.iconSize} color={theme.components.aiActionTargets.iconColor} weight="regular" />,
      onPress: onAudioLog,
      accessibilityLabel: "Record audio",
      accessibilityHint: "Opens audio recording for voice food logging"
    },
  ];

  const toggleFAB = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);

    // Animate expansion/collapse
    expandAnimation.value = withSpring(newIsExpanded ? 1 : 0, {
      damping: 18,
      stiffness: 150,
      mass: 1,
    });

    // Animate icon rotation
    rotationAnimation.value = withSpring(newIsExpanded ? 1 : 0, {
      damping: 18,
      stiffness: 150,
    });

    // Animate backdrop
    backdropAnimation.value = withTiming(newIsExpanded ? 1 : 0, {
      duration: 300,
    });
  };

  const handleActionPress = (action: () => void) => {
    // Close FAB first, then execute action
    setIsExpanded(false);
    expandAnimation.value = withSpring(0, {
      damping: 18,
      stiffness: 150,
      mass: 1,
    });
    rotationAnimation.value = withSpring(0, {
      damping: 18,
      stiffness: 150,
    });
    backdropAnimation.value = withTiming(0, {
      duration: 300,
    });
    
    // Execute the action after a short delay for smooth animation
    setTimeout(action, 150);
  };

  // Main FAB animated styles
  const mainFabAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(rotationAnimation.value, [0, 1], [0, 45]);
    
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // Action button animated styles (simplified for stability)
  const getActionButtonAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const scale = interpolate(
        expandAnimation.value,
        [0, 1],
        [0, 1],
        'clamp'
      );
      const opacity = interpolate(
        expandAnimation.value,
        [0, 1],
        [0, 1],
        'clamp'
      );
      
      return {
        transform: [{ scale }],
        opacity,
      };
    });
  };

  // Backdrop animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropAnimation.value * 0.3,
      pointerEvents: backdropAnimation.value > 0 ? 'auto' : 'none',
    };
  });

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable style={styles.backdropPressable} onPress={toggleFAB} />
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {actionButtons.map((button, index) => (
          <Animated.View
            key={index}
            style={[
              styles.actionButtonWrapper,
              getActionButtonAnimatedStyle(actionButtons.length - 1 - index) // Reverse order for bottom-up animation
            ]}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleActionPress(button.onPress)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={button.accessibilityLabel}
              accessibilityHint={button.accessibilityHint}
            >
              {button.icon}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.mainFab}
        onPress={toggleFAB}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? "Close food logging options" : "Open food logging options"}
        accessibilityHint={isExpanded ? "Closes the food logging menu" : "Shows food logging options"}
        accessibilityState={{ expanded: isExpanded }}
      >
        <Animated.View style={mainFabAnimatedStyle}>
          <PlusIcon 
            size={theme.components.aiActionTargets.iconSize} 
            color={theme.components.aiActionTargets.iconColor} 
            weight="bold" 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
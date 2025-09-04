import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./CustomTabBar.styles";
import { SegmentedControl } from "../SegmentedControl";
import { DraggableButton } from "../DraggableButton";
import { DropZones } from "../DropZones";
import { BlurView } from "expo-blur";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const [isQuickActionsActive, setIsQuickActionsActive] = useState(false);

  const mountProgress = useSharedValue(0);
  const tabBarOpacity = useSharedValue(1);
  const segmentedControlOpacity = useSharedValue(1);

  useEffect(() => {
    // Subtle slide-up animation on mount
    mountProgress.value = withDelay(
      100,
      withSpring(1, {
        damping: 20,
        stiffness: 200,
      })
    );
  }, []);

  useEffect(() => {
    if (isQuickActionsActive) {
      // Fade out the segmented control when quick actions are active
      segmentedControlOpacity.value = withSpring(0.2, { damping: 20, stiffness: 300 });
    } else {
      // Fade back in when quick actions are not active
      segmentedControlOpacity.value = withSpring(1, { damping: 20, stiffness: 300 });
    }
  }, [isQuickActionsActive]);

  const handleLongPressStart = () => {
    console.log("Long press detected, activating quick actions");
    setIsQuickActionsActive(true);
  };

  const handleDragEnd = (targetZone: "camera" | "microphone" | null, buttonX: number, buttonY: number) => {
    setIsQuickActionsActive(false);
    
    // Calculate screen coordinates from button position
    // Button position is relative to its container, need to convert to screen coordinates
    const dropZoneHeight = SCREEN_HEIGHT * 0.30; // 30% as updated
    const spacing = 16; // theme.spacing.lg equivalent
    const bottomPadding = 140; // Same as in styles
    
    // Calculate drop zone boundaries (both zones are at bottom)
    const microphoneZoneTop = SCREEN_HEIGHT - bottomPadding - dropZoneHeight; // Bottom zone
    const cameraZoneTop = microphoneZoneTop - dropZoneHeight - spacing; // Above microphone zone
    
    // Convert button's relative position to approximate screen position
    // Note: This is simplified - in production you'd want more precise calculations
    const buttonScreenY = SCREEN_HEIGHT - 100 + buttonY; // Approximate conversion
    
    let actualTargetZone: "camera" | "microphone" | null = null;
    
    // Check if button is within microphone zone (bottom)
    if (buttonScreenY >= microphoneZoneTop && buttonScreenY <= SCREEN_HEIGHT - bottomPadding + dropZoneHeight) {
      actualTargetZone = "microphone";
    }
    // Check if button is within camera zone (above microphone)
    else if (buttonScreenY >= cameraZoneTop && buttonScreenY < microphoneZoneTop - spacing) {
      actualTargetZone = "camera";
    }
    
    console.log("Drag ended - Button Y:", buttonScreenY, "Camera zone:", cameraZoneTop, "Microphone zone:", microphoneZoneTop, "Target:", actualTargetZone);
    
    if (actualTargetZone === "camera") {
      console.log("camera started");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (actualTargetZone === "microphone") {
      console.log("recording started");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleNewPress = () => {
    if (!isQuickActionsActive) {
      onNewPress();
    }
  };

  const mountAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: (1 - mountProgress.value) * 20,
        },
      ],
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
              style={[styles.segmentedControlWrapper, segmentedControlAnimatedStyle]}
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
                onLongPressStart={handleLongPressStart}
                onDragEnd={handleDragEnd}
                isQuickActionsActive={isQuickActionsActive}
              />
            </View>
        </View>
      </Animated.View>
      
      {/* Full-screen drop zones overlay */}
      <DropZones isVisible={isQuickActionsActive} />
    </>
  );
};
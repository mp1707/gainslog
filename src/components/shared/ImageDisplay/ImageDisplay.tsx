import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./ImageDisplay.styles";

interface ImageDisplayProps {
  imageUrl?: string;
  isUploading: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  isUploading,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  
  // Toggle state for height expansion
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Shared values for animations
  const skeletonOpacity = useSharedValue(0.3);
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.95);
  const pressScale = useSharedValue(1);
  const containerHeight = useSharedValue(200);
  
  // Skeleton pulsing animation
  useEffect(() => {
    if (isUploading) {
      skeletonOpacity.value = withRepeat(
        withTiming(0.7, { duration: 1000 }),
        -1,
        true
      );
    }
  }, [isUploading, skeletonOpacity]);
  
  // Image entrance animation
  useEffect(() => {
    if (imageUrl && !isUploading) {
      imageOpacity.value = withTiming(1, { duration: 400 });
      imageScale.value = withTiming(1, { duration: 400 });
    } else {
      imageOpacity.value = withTiming(0, { duration: 200 });
      imageScale.value = withTiming(0.95, { duration: 200 });
    }
  }, [imageUrl, isUploading, imageOpacity, imageScale]);

  // Height toggle animation
  useEffect(() => {
    containerHeight.value = withSpring(isExpanded ? 300 : 150, {
      damping: 20,
      stiffness: 300,
    });
  }, [isExpanded, containerHeight]);

  // Press handlers
  const handlePressIn = () => {
    pressScale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
    transform: [{ scale: pressScale.value }],
  }));

  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(skeletonOpacity.value, [0.3, 0.7], [0.3, 0.7]),
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  // Don't render anything if no image and not uploading
  if (!imageUrl && !isUploading) {
    return null;
  }

  const canInteract = imageUrl && !isUploading;

  const content = (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {isUploading && (
        <Animated.View style={[styles.skeleton, skeletonAnimatedStyle]} />
      )}
      
      {imageUrl && !isUploading && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
      )}
    </Animated.View>
  );

  if (canInteract) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} image view`}
        accessibilityHint="Double tap to toggle image size"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
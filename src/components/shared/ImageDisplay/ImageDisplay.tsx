import React, { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
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
  
  // Shared values for animations
  const skeletonOpacity = useSharedValue(0.3);
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.95);
  
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

  // Animated styles
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

  return (
    <View style={styles.container}>
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
    </View>
  );
};
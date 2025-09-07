import React, { useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useTheme } from "@/theme";
import { createStyles } from "./MediaLibraryPreview.styles";

interface MediaLibraryPreviewProps {
  onImageSelected: (uri: string) => void;
  style?: any;
}

export const MediaLibraryPreview: React.FC<MediaLibraryPreviewProps> = ({
  onImageSelected,
  style,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const [recentImages, setRecentImages] = React.useState<MediaLibrary.Asset[]>([]);

  // Animation shared values
  const animationProgress = useSharedValue(0);
  const pressProgress = useSharedValue(0);

  const fetchRecentImages = useCallback(async () => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        first: 3,
        sortBy: ["creationTime"],
        mediaType: MediaLibrary.MediaType.photo,
      });
      setRecentImages(assets);
      // Trigger animation when images are loaded
      if (assets.length > 0) {
        animationProgress.value = withDelay(300, withSpring(1, {
          stiffness: 120,
          damping: 20,
          mass: 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching recent images:", error);
      // Gracefully handle permission or access errors
      setRecentImages([]);
    }
  }, [animationProgress]);

  const handlePressIn = useCallback(() => {
    // Subtle haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    pressProgress.value = withSpring(1, {
      stiffness: 500,
      damping: 30,
    });
  }, [pressProgress]);

  const handlePressOut = useCallback(() => {
    pressProgress.value = withSpring(0, {
      stiffness: 300,
      damping: 20,
    });
  }, [pressProgress]);

  const handleImagePickerPress = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        // Refresh recent images after selection
        await fetchRecentImages();
      }
    } catch (error) {
      console.error("Error launching image picker:", error);
    }
  }, [onImageSelected, fetchRecentImages]);

  // Create animated styles for each of the 3 possible images
  const animatedStyle0 = useAnimatedStyle(() => {
    const index = 0;
    const baseRotation = (index - 1) * 10;
    const baseTranslateX = index * 4;
    const baseTranslateY = index * -4;
    
    // Staggered animation timing for arc effect
    const staggerDelay = index * 0.15;
    const animProgress = Math.max(0, Math.min(1, animationProgress.value - staggerDelay));
    
    // Calculate arc motion - images start stacked and fan out
    const rotation = baseRotation * animProgress;
    const translateX = baseTranslateX * animProgress;
    const translateY = baseTranslateY * animProgress;
    
    // Press feedback - collapse back to center and scale down
    const pressedRotation = rotation * (1 - pressProgress.value);
    const pressedTranslateX = translateX * (1 - pressProgress.value);
    const pressedTranslateY = translateY * (1 - pressProgress.value);
    const scale = 1 - pressProgress.value * 0.15; // 15% smaller when pressed
    
    return {
      transform: [
        { rotate: `${pressedRotation}deg` },
        { translateX: pressedTranslateX },
        { translateY: pressedTranslateY },
        { scale },
      ],
    };
  });

  const animatedStyle1 = useAnimatedStyle(() => {
    const index = 1;
    const baseRotation = (index - 1) * 10;
    const baseTranslateX = index * 4;
    const baseTranslateY = index * -4;
    
    // Staggered animation timing for arc effect
    const staggerDelay = index * 0.15;
    const animProgress = Math.max(0, Math.min(1, animationProgress.value - staggerDelay));
    
    // Calculate arc motion - images start stacked and fan out
    const rotation = baseRotation * animProgress;
    const translateX = baseTranslateX * animProgress;
    const translateY = baseTranslateY * animProgress;
    
    // Press feedback - collapse back to center and scale down
    const pressedRotation = rotation * (1 - pressProgress.value);
    const pressedTranslateX = translateX * (1 - pressProgress.value);
    const pressedTranslateY = translateY * (1 - pressProgress.value);
    const scale = 1 - pressProgress.value * 0.15; // 15% smaller when pressed
    
    return {
      transform: [
        { rotate: `${pressedRotation}deg` },
        { translateX: pressedTranslateX },
        { translateY: pressedTranslateY },
        { scale },
      ],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const index = 2;
    const baseRotation = (index - 1) * 10;
    const baseTranslateX = index * 4;
    const baseTranslateY = index * -4;
    
    // Staggered animation timing for arc effect
    const staggerDelay = index * 0.15;
    const animProgress = Math.max(0, Math.min(1, animationProgress.value - staggerDelay));
    
    // Calculate arc motion - images start stacked and fan out
    const rotation = baseRotation * animProgress;
    const translateX = baseTranslateX * animProgress;
    const translateY = baseTranslateY * animProgress;
    
    // Press feedback - collapse back to center and scale down
    const pressedRotation = rotation * (1 - pressProgress.value);
    const pressedTranslateX = translateX * (1 - pressProgress.value);
    const pressedTranslateY = translateY * (1 - pressProgress.value);
    const scale = 1 - pressProgress.value * 0.15; // 15% smaller when pressed
    
    return {
      transform: [
        { rotate: `${pressedRotation}deg` },
        { translateX: pressedTranslateX },
        { translateY: pressedTranslateY },
        { scale },
      ],
    };
  });

  const animatedStyles = [animatedStyle0, animatedStyle1, animatedStyle2];

  useEffect(() => {
    fetchRecentImages();
  }, [fetchRecentImages]);

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={handleImagePickerPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Open photo library"
    >
      {recentImages.length > 0 ? (
        recentImages.map((asset, index) => (
          <Animated.Image
            key={asset.id}
            source={{ uri: asset.uri }}
            style={[
              styles.stackedImage,
              animatedStyles[index],
              {
                zIndex: 3 - index,
              },
            ]}
          />
        ))
      ) : (
        <Animated.View style={styles.placeholder} />
      )}
    </Pressable>
  );
};
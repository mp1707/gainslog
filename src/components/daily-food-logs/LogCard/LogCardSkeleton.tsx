import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { Card } from "@/components/Card";
import { createStyles } from "./LogCard.styles";

export const LogCardSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Shimmer animation
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withTiming(0.8, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [shimmerOpacity]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  return (
    <View style={styles.cardContainer}>
      <Card elevated={true} style={styles.card}>
        <View style={styles.pressable}>
          <View style={styles.contentContainer}>
            <View style={styles.leftSection}>
              {/* Title skeleton - 2 lines */}
              <View style={styles.skeletonTitleContainer}>
                <Animated.View
                  style={[styles.skeletonTitleLine, shimmerAnimatedStyle]}
                />
                <Animated.View
                  style={[styles.skeletonTitleLineShort, shimmerAnimatedStyle]}
                />
              </View>

              {/* Description skeleton */}
              <Animated.View
                style={[styles.skeletonDescription, shimmerAnimatedStyle]}
              />

              {/* Confidence badge skeleton */}
              <View style={styles.confidenceContainer}>
                <Animated.View
                  style={[styles.skeletonConfidenceBadge, shimmerAnimatedStyle]}
                />
              </View>
            </View>

            <View style={styles.rightSection}>
              {/* Nutrition values skeleton */}
              <View style={styles.skeletonNutritionContainer}>
                <Animated.View
                  style={[styles.skeletonNutritionValue, shimmerAnimatedStyle]}
                />
                <Animated.View
                  style={[styles.skeletonNutritionValue, shimmerAnimatedStyle]}
                />
                <Animated.View
                  style={[styles.skeletonNutritionValue, shimmerAnimatedStyle]}
                />
                <Animated.View
                  style={[styles.skeletonNutritionValue, shimmerAnimatedStyle]}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};
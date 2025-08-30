import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Favorite, FoodLog } from "@/types/models";
import { useTheme } from "@/theme";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { SkeletonPill, ConfidenceBadge } from "@/components/shared";
import { getConfidenceLevel } from "@/utils/getConfidenceLevel";
import { createStyles } from "./LogCard.styles";
import { NutritionList } from "./NutritionList";

interface LogCardProps {
  foodLog: FoodLog | Favorite;
  isLoading?: boolean;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, isLoading }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Track previous loading state to detect completion
  const previousLoadingRef = useRef(isLoading);

  // Animation values for staggered reveal
  const titleOpacity = useSharedValue(isLoading ? 0 : 1);
  const descriptionOpacity = useSharedValue(isLoading ? 0 : 1);
  const nutritionOpacity = useSharedValue(isLoading ? 0 : 1);

  // Flash animation for confidence feedback
  const flashOpacity = useSharedValue(0);

  const displayTitle = foodLog.title || "New Log";
  const estimationConfidence =
    "estimationConfidence" in foodLog
      ? foodLog.estimationConfidence
      : undefined;

  // Get confidence info for flash overlay color
  const confidenceInfo = getConfidenceLevel(estimationConfidence);

  useEffect(() => {
    const wasLoading = previousLoadingRef.current;

    if (!isLoading && wasLoading) {
      // Only animate when transitioning from loading to loaded state
      // Trigger haptic feedback when loading completes
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);

      // Staggered reveal animation sequence
      titleOpacity.value = withDelay(
        0,
        withSpring(1, { stiffness: 400, damping: 30 })
      );
      descriptionOpacity.value = withDelay(
        150,
        withSpring(1, { stiffness: 400, damping: 30 })
      );
      nutritionOpacity.value = withDelay(
        300,
        withSpring(1, { stiffness: 400, damping: 30 })
      );

      // Flash animation for confidence feedback - starts after content loads
      if (estimationConfidence !== undefined) {
        flashOpacity.value = withDelay(
          450,
          withSpring(0.6, { stiffness: 400, damping: 30 }, (finished) => {
            if (finished) {
              flashOpacity.value = withDelay(
                300,
                withSpring(0, { stiffness: 400, damping: 30 })
              );
            }
          })
        );
      }
    } else if (!isLoading && !wasLoading) {
      // If card renders without loading, show content immediately without animation
      titleOpacity.value = 1;
      descriptionOpacity.value = 1;
      nutritionOpacity.value = 1;
      flashOpacity.value = 0;
    } else if (isLoading) {
      // Hide content during loading
      titleOpacity.value = 0;
      descriptionOpacity.value = 0;
      nutritionOpacity.value = 0;
      flashOpacity.value = 0;
    }

    // Update the previous loading state
    previousLoadingRef.current = isLoading;
  }, [isLoading]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        scale: 0.95 + titleOpacity.value * 0.05,
      },
    ],
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [
      {
        scale: 0.95 + descriptionOpacity.value * 0.05,
      },
    ],
  }));

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));


  return (
    <View style={styles.cardContainer}>
      <Card elevated={true} style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.leftSection}>
            {/* Title Section */}
            {isLoading ? (
              <SkeletonPill width="80%" height={22} />
            ) : (
              <Animated.View style={titleAnimatedStyle}>
                <AppText role="Headline" style={styles.title} numberOfLines={2}>
                  {displayTitle}
                </AppText>
              </Animated.View>
            )}

            {/* Description Section */}
            {isLoading ? (
              <View style={{ marginTop: 4 }}>
                <SkeletonPill width="90%" height={18} />
              </View>
            ) : (
              foodLog.description && (
                <Animated.View style={descriptionAnimatedStyle}>
                  <AppText
                    role="Body"
                    color="secondary"
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {foodLog.description}
                  </AppText>
                </Animated.View>
              )
            )}

            {/* Confidence Badge Section */}
            <ConfidenceBadge
              estimationConfidence={estimationConfidence}
              isLoading={isLoading}
              wasLoading={previousLoadingRef.current}
              style={styles.confidenceContainerSpacing}
            />
          </View>

          <View style={styles.rightSection}>
            <NutritionList
              nutrition={{
                calories: foodLog.calories,
                protein: foodLog.protein,
                carbs: foodLog.carbs,
                fat: foodLog.fat,
              }}
              isLoading={isLoading}
              wasLoading={previousLoadingRef.current}
            />
          </View>
        </View>
      </Card>

      {/* Flash overlay for confidence feedback */}
      {estimationConfidence !== undefined && (
        <Animated.View
          style={[
            styles.flashOverlay,
            { backgroundColor: confidenceInfo.color.background },
            flashAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

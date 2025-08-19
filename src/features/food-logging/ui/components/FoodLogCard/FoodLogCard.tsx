import React, { useEffect, useRef } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FoodLogCard.styles";
import { FoodLogCardSkeleton } from "../../FoodLogCardSkeleton";
import { StarIcon } from "phosphor-react-native";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { FoodLogCardView } from "../../FoodLogCardView";

interface FoodLogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogCard: React.FC<FoodLogCardProps> = ({
  foodLog,
  onAddInfo,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { isFavorite, toggleForLog } = useFavoritesStore();
  const favorite = isFavorite(foodLog);

  // Loading state detection
  const isLoading = foodLog.estimationConfidence === 0;

  // Animation for flash effect and scaling when estimation completes
  const flashOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const prevConfidence = useRef(foodLog.estimationConfidence);


  // Get color based on confidence level (matching Badge component logic)
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "#10b981"; // Green
    if (confidence >= 60) return "#f59e0b"; // Amber
    if (confidence >= 40) return "#ef4444"; // Red
    return colors.secondaryText; // Uncertain (gray)
  };

  const flashColor = getConfidenceColor(foodLog.estimationConfidence);

  // Watch for estimation completion (confidence changes from 0 to positive)
  useEffect(() => {
    const currentConfidence = foodLog.estimationConfidence;
    const wasLoading = prevConfidence.current === 0;
    const isComplete = currentConfidence > 0;

    // Only animate when going from loading (0) to complete (>0)
    if (wasLoading && isComplete) {
      // Enhanced flash animation - slower, more luxurious timing
      flashOpacity.value = withSequence(
        withTiming(0.2, { duration: 300, easing: Easing.linear }),
        withTiming(0.08, { duration: 300, easing: Easing.linear }),
        withTiming(0, { duration: 900, easing: Easing.linear })
      );

      // Synchronized subtle scaling animation - slower and gentler
      cardScale.value = withSequence(
        withSpring(1.02, { damping: 25, stiffness: 250 }),
        withSpring(1.0, { damping: 30, stiffness: 350 })
      );
    }

    // Update previous confidence for next render
    prevConfidence.current = currentConfidence;
  }, [foodLog.estimationConfidence, flashOpacity, cardScale]);

  // Animated styles for flash overlay and card scaling
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: flashColor,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };


  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      {isLoading ? (
        <FoodLogCardSkeleton foodLog={foodLog} />
      ) : (
        <>
          <FoodLogCardView
            title={foodLog.userTitle || foodLog.generatedTitle}
            description={foodLog.userDescription}
            calories={foodLog.calories}
            protein={foodLog.protein}
            carbs={foodLog.carbs}
            fat={foodLog.fat}
            confidence={foodLog.estimationConfidence}
            showConfidence
            onEdit={handleCardPress}
            accessoryRight={
              <TouchableOpacity
                onPress={async () => {
                  Haptics.selectionAsync();
                  await toggleForLog(foodLog);
                }}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={
                  favorite ? "Remove favorite" : "Add to favorites"
                }
                accessibilityHint={
                  favorite
                    ? "Removes this entry from your favorites"
                    : "Adds this entry to your favorites"
                }
              >
                {favorite ? (
                  <StarIcon size={20} color="#FDB813" weight="fill" />
                ) : (
                  <StarIcon size={20} color="#FDB813" weight="regular" />
                )}
              </TouchableOpacity>
            }
          />

          {/* Flash overlay for success animation */}
          <Animated.View
            style={[styles.flashOverlay, flashAnimatedStyle]}
            pointerEvents="none"
          />
        </>
      )}
    </Animated.View>
  );
};

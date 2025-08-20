import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { DotsThreeIcon } from "phosphor-react-native";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FoodLogCard.styles";
import { FoodLogCardSkeleton } from "../../FoodLogCardSkeleton";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { FoodLogCardView } from "../../FoodLogCardView";
import { FoodLogOptionsSheet } from "../FoodLogOptionsSheet";

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
  const { deleteFoodLogById } = useFoodLogStore();
  const favorite = isFavorite(foodLog);
  const [optionsVisible, setOptionsVisible] = useState(false);

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

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOptionsVisible(true);
  };

  const handleEdit = () => {
    setOptionsVisible(false);
    onAddInfo(foodLog);
  };

  const handleToggleFavorite = async () => {
    setOptionsVisible(false);
    await toggleForLog(foodLog);
  };

  const handleDelete = () => {
    setOptionsVisible(false);
    Alert.alert(
      "Delete Food Log",
      "Are you sure you want to delete this food log entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFoodLogById(foodLog.id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete food log entry. Please try again.");
            }
          },
        },
      ]
    );
  };


  return (
    <>
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
                  onPress={handleMenuPress}
                  style={styles.menuButton}
                  accessibilityRole="button"
                  accessibilityLabel="Food log options"
                  accessibilityHint="Opens menu with edit, favorite, and delete options"
                >
                  <DotsThreeIcon
                    size={20}
                    color={colors.secondaryText}
                    weight="regular"
                  />
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
      
      <FoodLogOptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        foodLog={foodLog}
        isFavorite={favorite}
        onEdit={handleEdit}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
      />
    </>
  );
};

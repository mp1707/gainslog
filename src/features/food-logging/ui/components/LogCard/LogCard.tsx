import React from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { NutritionList } from "@/shared/ui/molecules";
import { getConfidenceInfo } from "../../../utils";
import { createStyles } from "./LogCard.styles";

interface LogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, onAddInfo }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation shared values
  const scale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);

  const displayTitle = foodLog.userTitle || foodLog.generatedTitle;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };

  const handlePressIn = () => {
    // Press down animation - scale down and flash
    scale.value = withTiming(0.97, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
    pressFlashOpacity.value = withTiming(0.08, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    // Release animation - spring back and fade flash
    scale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
    pressFlashOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  };

  const confidenceInfo = getConfidenceInfo(foodLog.estimationConfidence);
  const ConfidenceIcon = confidenceInfo.icon;

  const getConfidenceStyles = (level: string) => {
    const styleMap = {
      high: { badge: styles.confidenceHigh, text: styles.confidenceHighText },
      medium: {
        badge: styles.confidenceMedium,
        text: styles.confidenceMediumText,
      },
      low: { badge: styles.confidenceLow, text: styles.confidenceLowText },
      uncertain: {
        badge: styles.confidenceUncertain,
        text: styles.confidenceUncertainText,
      },
    };
    return styleMap[level as keyof typeof styleMap];
  };

  const confidenceStyles = getConfidenceStyles(confidenceInfo.level);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressFlashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressFlashOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      <Card elevated={true} style={styles.card}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityLabel={`Edit food log: ${displayTitle}`}
          accessibilityHint="Double tap to edit this food log entry"
        >
          <View style={styles.contentContainer}>
            <View style={styles.leftSection}>
              <AppText role="Headline" style={styles.title} numberOfLines={2}>
                {displayTitle}
              </AppText>

              {foodLog.userDescription && (
                <AppText
                  role="Body"
                  color="secondary"
                  style={styles.description}
                  numberOfLines={2}
                >
                  {foodLog.userDescription}
                </AppText>
              )}

              <View style={styles.confidenceContainer}>
                <View
                  style={[styles.confidenceBadge, confidenceStyles.badge]}
                  accessibilityRole="text"
                  accessibilityLabel={confidenceInfo.accessibilityLabel}
                >
                  <ConfidenceIcon
                    size={14}
                    color={confidenceStyles.text.color}
                    weight="fill"
                  />
                  <AppText
                    style={[styles.confidenceText, confidenceStyles.text]}
                  >
                    {confidenceInfo.label}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.rightSection}>
              <NutritionList
                nutrition={{
                  calories: foodLog.calories,
                  protein: foodLog.protein,
                  carbs: foodLog.carbs,
                  fat: foodLog.fat,
                }}
              />
            </View>
          </View>
        </Pressable>
      </Card>
      
      {/* Press flash overlay for press feedback */}
      <Animated.View
        style={[styles.pressOverlay, pressFlashAnimatedStyle]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

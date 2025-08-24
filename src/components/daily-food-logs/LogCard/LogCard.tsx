import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { FoodLog } from "@/types";
import { useTheme } from "@/theme";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { getConfidenceInfo } from "@/utils/nutrition";
import { createStyles } from "./LogCard.styles";
import { LogCardSkeleton } from "./LogCardSkeleton";
import { NutritionList } from "./NutritionList";

interface LogCardProps {
  foodLog: FoodLog;
  onPress?: () => void;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, onPress }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation shared values - must be declared before any conditional returns
  const scale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);

  // Animated styles - must be declared before any conditional returns
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressFlashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressFlashOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  // Show skeleton while loading
  const isLoading = (foodLog.estimationConfidence ?? 0) === 0;

  if (isLoading) {
    return <LogCardSkeleton />;
  }

  const displayTitle = foodLog.userTitle || foodLog.generatedTitle;

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

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const confidenceInfo = getConfidenceInfo(foodLog.estimationConfidence ?? 0);
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

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      <Card elevated={true} style={styles.card}>
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
                  calories:
                    foodLog.userCalories ?? foodLog.generatedCalories ?? 0,
                  protein: foodLog.userProtein ?? foodLog.generatedProtein ?? 0,
                  carbs: foodLog.userCarbs ?? foodLog.generatedCarbs ?? 0,
                  fat: foodLog.userFat ?? foodLog.generatedFat ?? 0,
                }}
              />
            </View>
          </View>
      </Card>

      {/* Press flash overlay for press feedback */}
      <Animated.View
        style={[styles.pressOverlay, pressFlashAnimatedStyle]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

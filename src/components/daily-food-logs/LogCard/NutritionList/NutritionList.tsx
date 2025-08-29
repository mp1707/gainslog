import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { AppText } from "@/components";
import { SkeletonPill } from "@/components/shared/SkeletonPill";
import { useTheme } from "@/theme";
import { createStyles } from "./NutritionList.styles";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionListProps {
  nutrition: NutritionData;
  isLoading?: boolean;
  wasLoading?: boolean;
}

// Component for individual nutrition row with staggered fade animation
const AnimatedNutritionValue: React.FC<{
  value: number;
  label: string;
  isLoading: boolean;
  wasLoading: boolean;
  delay: number;
  textStyle: any;
  large?: boolean;
}> = ({ value, label, isLoading, wasLoading, delay, textStyle, large }) => {
  const skeletonOpacity = useSharedValue(isLoading ? 1 : 0);
  const valueOpacity = useSharedValue(isLoading ? 0 : wasLoading ? 0 : 1);

  useEffect(() => {
    if (isLoading) {
      // Show skeleton, hide value
      skeletonOpacity.value = withTiming(1, { duration: 200 });
      valueOpacity.value = withTiming(0, { duration: 200 });
    } else if (wasLoading) {
      // Only animate when transitioning from loading to loaded state
      skeletonOpacity.value = withDelay(delay, withTiming(0, { duration: 300 }));
      valueOpacity.value = withDelay(delay + 150, withTiming(1, { duration: 400 }));
    } else {
      // Show content immediately without animation if not coming from loading state
      skeletonOpacity.value = 0;
      valueOpacity.value = 1;
    }
  }, [isLoading, wasLoading, delay]);

  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skeletonOpacity.value,
  }));

  const valueAnimatedStyle = useAnimatedStyle(() => ({
    opacity: valueOpacity.value,
  }));

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View style={[{ position: 'absolute' }, skeletonAnimatedStyle]}>
        <SkeletonPill width={large ? 60 : 50} height={16} />
      </Animated.View>
      <Animated.View style={valueAnimatedStyle}>
        <AppText style={textStyle}>{Math.round(value)} {label}</AppText>
      </Animated.View>
    </View>
  );
};

export const NutritionList: React.FC<NutritionListProps> = ({
  nutrition,
  isLoading = false,
  wasLoading = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation values for dots scaling during loading
  const dotScales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];



  const nutritionItems = [
    {
      key: "calories",
      value: Math.round(nutrition.calories),
      label: "kcal",
      color: colors.semantic.calories,
      delay: 450, // Staggered reveal timing
    },
    {
      key: "protein",
      value: Math.round(nutrition.protein),
      label: "g Protein",
      color: colors.semantic.protein,
      delay: 550,
    },
    {
      key: "carbs",
      value: Math.round(nutrition.carbs),
      label: "g Carbs",
      color: colors.semantic.carbs,
      delay: 650,
    },
    {
      key: "fat",
      value: Math.round(nutrition.fat),
      label: "g Fat",
      color: colors.semantic.fat,
      delay: 750,
    },
  ];

  useEffect(() => {
    if (isLoading) {
      // Start dot scaling animations with staggered timing
      dotScales.forEach((scale, index) => {
        scale.value = withDelay(
          index * 100,
          withRepeat(withTiming(1.4, { duration: 600 }), -1, true)
        );
      });
    } else if (wasLoading) {
      // Only animate dots when transitioning from loading to loaded state
      dotScales.forEach((scale) => {
        scale.value = withSpring(1, { stiffness: 400, damping: 30 });
      });
    } else {
      // Set dots to normal state without animation if not coming from loading
      dotScales.forEach((scale) => {
        scale.value = 1;
      });
    }
  }, [isLoading, wasLoading]);

  return (
    <View style={styles.nutritionList}>
      {nutritionItems.map((item, index) => {
        const dotAnimatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: dotScales[index].value }],
        }));

        return (
          <View
            key={item.key}
            style={styles.nutritionRow}
          >
            <Animated.View
              style={[
                styles.nutritionDot,
                { backgroundColor: item.color },
                dotAnimatedStyle,
              ]}
            />
            <AnimatedNutritionValue
              value={item.value}
              label={item.label}
              isLoading={isLoading}
              wasLoading={wasLoading}
              delay={item.delay}
              textStyle={styles.nutritionText}
              large={item.key === "calories"}
            />
          </View>
        );
      })}
    </View>
  );
};

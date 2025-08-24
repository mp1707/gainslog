import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import {
  ChartLineUpIcon,
  BarbellIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./ProteinCalculationCard.styles";
import type { ProteinCalculationMethod } from "@/types";

export interface ProteinCalculationCardProps {
  method: ProteinCalculationMethod;
  bodyWeight: number;
  isSelected: boolean;
  onSelect: (method: ProteinCalculationMethod) => void;
}

const CALCULATION_METHODS: Record<string, ProteinCalculationMethod> = {
  optimal_growth: {
    id: "optimal_growth",
    title: "1.6 g/kg - Optimal Growth",
    description:
      "The evidence-based point of diminishing returns for maximizing muscle growth in a caloric surplus or maintenance.",
    multiplier: 1.6,
  },
  dedicated_athlete: {
    id: "dedicated_athlete",
    title: "2.0 g/kg - Dedicated Athlete",
    description:
      "A robust target for dedicated athletes to optimize all training adaptations and ensure consistent muscle growth.",
    multiplier: 2.0,
  },
  anabolic_insurance: {
    id: "anabolic_insurance",
    title: "2.2 g/kg - Anabolic Insurance",
    description:
      "The upper-end target to ensure protein is never a limiting factor. Ideal for advanced athletes.",
    multiplier: 2.2,
  },
  max_preservation: {
    id: "max_preservation",
    title: "3.0 g/kg - Max Preservation",
    description:
      "A very high intake to maximize muscle retention during a significant or prolonged caloric deficit (cutting).",
    multiplier: 3.0,
  },
};

const getIconForMethod = (methodId: string, color: string, size: number) => {
  switch (methodId) {
    case "optimal_growth":
      return <ChartLineUpIcon size={size} color={color} weight="regular" />;
    case "dedicated_athlete":
      return <BarbellIcon size={size} color={color} weight="regular" />;
    case "anabolic_insurance":
      return <ShieldCheckIcon size={size} color={color} weight="regular" />;
    case "max_preservation":
      return <TrophyIcon size={size} color={color} weight="regular" />;
    default:
      return <ChartLineUpIcon size={size} color={color} weight="regular" />;
  }
};

export const ProteinCalculationCard: React.FC<ProteinCalculationCardProps> = ({
  method,
  bodyWeight,
  isSelected,
  onSelect,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  // Calculate protein intake (convert kg to grams, round to nearest 5)
  const calculatedProtein =
    bodyWeight > 0 ? Math.round((bodyWeight * method.multiplier) / 5) * 5 : 0;

  const iconColor = isSelected ? colors.accent : colors.primaryText;
  const iconWeight = isSelected ? "fill" : "regular";

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(method);
  };

  const handlePressIn = () => {
    // Press down animation - scale down
    pressScale.value = withTiming(0.97, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    // Release animation - spring back
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${method.title} protein calculation method`}
      accessibilityHint={`Calculate ${calculatedProtein}g protein per day based on ${method.description.toLowerCase()}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          pressAnimatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {React.cloneElement(getIconForMethod(method.id, iconColor, 24), {
                weight: iconWeight,
              })}
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {method.title}
              </Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
          </View>

          <View style={styles.proteinContainer}>
            <Text
              style={[
                styles.proteinValue,
                isSelected && styles.selectedProteinValue,
              ]}
            >
              {calculatedProtein}g
            </Text>
            <Text style={styles.proteinLabel}>per day</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export { CALCULATION_METHODS };

import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./CompactMacroSummary.styles";

interface CompactMacroSummaryProps {
  protein: number;
  carbs: number;
  fat: number;
}

export const CompactMacroSummary: React.FC<CompactMacroSummaryProps> = ({
  protein,
  carbs,
  fat,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  
  // Animation values for dot entrance
  const proteinScale = useSharedValue(0);
  const carbsScale = useSharedValue(0);
  const fatScale = useSharedValue(0);
  
  // Trigger entrance animations on mount
  useEffect(() => {
    // Staggered entrance animations with spring physics
    proteinScale.value = withDelay(
      50,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
    carbsScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
    fatScale.value = withDelay(
      150,
      withSpring(1, {
        damping: 12,
        stiffness: 300,
      })
    );
  }, [protein, carbs, fat]); // Re-animate when values change

  // Define dot size constraints
  const minSize = 6;
  const maxSize = 24;
  
  // Find the maximum value to scale all dots relative to it
  const maxValue = Math.max(protein, carbs, fat);
  
  // Calculate dot sizes based on relative values
  const calculateDotSize = (value: number): number => {
    if (maxValue === 0) return minSize;
    return minSize + (value / maxValue) * (maxSize - minSize);
  };

  const proteinSize = calculateDotSize(protein);
  const carbsSize = calculateDotSize(carbs);
  const fatSize = calculateDotSize(fat);

  // Create dot style with dynamic size
  const createDotStyle = (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
  });
  
  // Animated styles for each dot
  const proteinDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: proteinScale.value }],
  }));
  
  const carbsDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: carbsScale.value }],
  }));
  
  const fatDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fatScale.value }],
  }));

  return (
    <View 
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`Macro nutrients: ${protein}g protein, ${carbs}g carbs, ${fat}g fat`}
    >
      <Animated.View 
        style={[
          styles.dot, 
          styles.proteinDot, 
          createDotStyle(proteinSize),
          proteinDotStyle
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          styles.carbsDot, 
          createDotStyle(carbsSize),
          carbsDotStyle
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          styles.fatDot, 
          createDotStyle(fatSize),
          fatDotStyle
        ]} 
      />
    </View>
  );
};
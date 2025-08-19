import React from "react";
import { View } from "react-native";
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

  return (
    <View 
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel={`Macro nutrients: ${protein}g protein, ${carbs}g carbs, ${fat}g fat`}
    >
      <View 
        style={[
          styles.dot, 
          styles.proteinDot, 
          createDotStyle(proteinSize)
        ]} 
      />
      <View 
        style={[
          styles.dot, 
          styles.carbsDot, 
          createDotStyle(carbsSize)
        ]} 
      />
      <View 
        style={[
          styles.dot, 
          styles.fatDot, 
          createDotStyle(fatSize)
        ]} 
      />
    </View>
  );
};
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface SimpleProgressIndicatorProps {
  percentages: NutrientValues;
  size?: number;
}

const NUTRIENT_ORDER = ['calories', 'protein', 'carbs', 'fat'] as const;

export const SimpleProgressIndicator: React.FC<SimpleProgressIndicatorProps> = ({
  percentages,
  size = 36,
}) => {
  const { colors } = useTheme();

  const ringColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  };

  // Calculate dot size and spacing based on container size
  const dotSize = Math.max(3, Math.floor(size / 12));
  const spacing = Math.max(1, Math.floor(size / 18));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing,
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
    },
  }), [size, dotSize, spacing]);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {NUTRIENT_ORDER.map((nutrient) => {
          const percentage = percentages[nutrient] || 0;
          const hasData = percentage > 0;
          
          return (
            <View
              key={nutrient}
              style={[
                styles.dot,
                {
                  backgroundColor: hasData 
                    ? ringColors[nutrient] 
                    : colors.disabledBackground,
                  opacity: hasData ? Math.min(1, percentage / 100) + 0.3 : 0.2,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};
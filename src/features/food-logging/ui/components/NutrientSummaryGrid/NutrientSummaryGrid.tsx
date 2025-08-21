import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { NutrientStat } from '@/shared/ui/atoms/NutrientStat';
import { createStyles } from './NutrientSummaryGrid.styles';

interface NutrientValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutrientSummaryGridProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

export const NutrientSummaryGrid: React.FC<NutrientSummaryGridProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  return (
    <View style={styles.container}>
      <NutrientStat
        label="Kcal"
        currentValue={totals.calories}
        goalValue={targets.calories}
        color={colors.semantic.calories}
      />
      <NutrientStat
        label="Protein"
        currentValue={totals.protein}
        goalValue={targets.protein}
        unit="g"
        color={colors.semantic.protein}
      />
      <NutrientStat
        label="Carbs"
        currentValue={totals.carbs}
        goalValue={targets.carbs}
        unit="g"
        color={colors.semantic.carbs}
      />
      <NutrientStat
        label="Fat"
        currentValue={totals.fat}
        goalValue={targets.fat}
        unit="g"
        color={colors.semantic.fat}
      />
    </View>
  );
};
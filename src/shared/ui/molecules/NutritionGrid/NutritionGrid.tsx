import React from 'react';
import { View, Text } from 'react-native';
import { NumericTextInput } from '@/shared/ui/atoms';
import { styles } from './NutritionGrid.styles';

interface NutritionGridProps {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  onCaloriesChange: (value: string) => void;
  onProteinChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  onFatChange: (value: string) => void;
  disabled?: boolean;
}

export const NutritionGrid: React.FC<NutritionGridProps> = ({
  calories,
  protein,
  carbs,
  fat,
  onCaloriesChange,
  onProteinChange,
  onCarbsChange,
  onFatChange,
  disabled = false,
}) => {
  return (
    <View style={[styles.section, disabled && styles.disabledSection]}>
      <Text style={[styles.title, disabled && styles.disabledTitle]}>
        Nutrition (Optional)
      </Text>
      <Text style={[styles.subtitle, disabled && styles.disabledSubtitle]}>
        Leave fields empty to have AI estimate missing values
      </Text>
      
      <View style={styles.grid}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.caloriesLabel, disabled && styles.disabledLabel]}>
            Calories
          </Text>
          <NumericTextInput
            value={calories}
            onChangeText={onCaloriesChange}
            placeholder="0"
            min={0}
            max={10000}
            disabled={disabled}
            accessibilityLabel="Calories input"
            accessibilityHint="Enter calories or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.proteinLabel, disabled && styles.disabledLabel]}>
            Protein (g)
          </Text>
          <NumericTextInput
            value={protein}
            onChangeText={onProteinChange}
            placeholder="0"
            min={0}
            max={500}
            disabled={disabled}
            accessibilityLabel="Protein input in grams"
            accessibilityHint="Enter protein or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.carbsLabel, disabled && styles.disabledLabel]}>
            Carbs (g)
          </Text>
          <NumericTextInput
            value={carbs}
            onChangeText={onCarbsChange}
            placeholder="0"
            min={0}
            max={500}
            disabled={disabled}
            accessibilityLabel="Carbohydrates input in grams"
            accessibilityHint="Enter carbohydrates or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.fatLabel, disabled && styles.disabledLabel]}>
            Fat (g)
          </Text>
          <NumericTextInput
            value={fat}
            onChangeText={onFatChange}
            placeholder="0"
            min={0}
            max={200}
            disabled={disabled}
            accessibilityLabel="Fat input in grams"
            accessibilityHint="Enter fat or leave empty for AI estimation"
          />
        </View>
      </View>
    </View>
  );
};
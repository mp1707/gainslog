import React from 'react';
import { View, Text } from 'react-native';
import { TextInput } from '@/shared/ui/atoms';
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
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Nutrition (Optional)</Text>
      <Text style={styles.subtitle}>
        Leave fields empty to have AI estimate missing values
      </Text>
      
      <View style={styles.grid}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.caloriesLabel]}>
            Calories
          </Text>
          <TextInput
            value={calories}
            onChangeText={onCaloriesChange}
            placeholder="0"
            keyboardType="numeric"
            accessibilityLabel="Calories input"
            accessibilityHint="Enter calories or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.proteinLabel]}>
            Protein (g)
          </Text>
          <TextInput
            value={protein}
            onChangeText={onProteinChange}
            placeholder="0"
            keyboardType="numeric"
            accessibilityLabel="Protein input in grams"
            accessibilityHint="Enter protein or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.carbsLabel]}>
            Carbs (g)
          </Text>
          <TextInput
            value={carbs}
            onChangeText={onCarbsChange}
            placeholder="0"
            keyboardType="numeric"
            accessibilityLabel="Carbohydrates input in grams"
            accessibilityHint="Enter carbohydrates or leave empty for AI estimation"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.fatLabel]}>
            Fat (g)
          </Text>
          <TextInput
            value={fat}
            onChangeText={onFatChange}
            placeholder="0"
            keyboardType="numeric"
            accessibilityLabel="Fat input in grams"
            accessibilityHint="Enter fat or leave empty for AI estimation"
          />
        </View>
      </View>
    </View>
  );
};
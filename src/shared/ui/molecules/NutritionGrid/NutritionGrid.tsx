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
        {disabled && ' - Recording...'}
      </Text>
      <Text style={[styles.subtitle, disabled && styles.disabledSubtitle]}>
        {disabled 
          ? 'Audio recording in progress - fields are temporarily disabled'
          : 'Leave fields empty to have AI estimate missing values'
        }
      </Text>
      
      <View style={styles.grid}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.caloriesLabel, disabled && styles.disabledLabel]}>
            Calories
          </Text>
          <TextInput
            value={calories}
            onChangeText={onCaloriesChange}
            placeholder="0"
            keyboardType="numeric"
            disabled={disabled}
            accessibilityLabel="Calories input"
            accessibilityHint={disabled ? "Disabled during recording" : "Enter calories or leave empty for AI estimation"}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.proteinLabel, disabled && styles.disabledLabel]}>
            Protein (g)
          </Text>
          <TextInput
            value={protein}
            onChangeText={onProteinChange}
            placeholder="0"
            keyboardType="numeric"
            disabled={disabled}
            accessibilityLabel="Protein input in grams"
            accessibilityHint={disabled ? "Disabled during recording" : "Enter protein or leave empty for AI estimation"}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.carbsLabel, disabled && styles.disabledLabel]}>
            Carbs (g)
          </Text>
          <TextInput
            value={carbs}
            onChangeText={onCarbsChange}
            placeholder="0"
            keyboardType="numeric"
            disabled={disabled}
            accessibilityLabel="Carbohydrates input in grams"
            accessibilityHint={disabled ? "Disabled during recording" : "Enter carbohydrates or leave empty for AI estimation"}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.fatLabel, disabled && styles.disabledLabel]}>
            Fat (g)
          </Text>
          <TextInput
            value={fat}
            onChangeText={onFatChange}
            placeholder="0"
            keyboardType="numeric"
            disabled={disabled}
            accessibilityLabel="Fat input in grams"
            accessibilityHint={disabled ? "Disabled during recording" : "Enter fat or leave empty for AI estimation"}
          />
        </View>
      </View>
    </View>
  );
};
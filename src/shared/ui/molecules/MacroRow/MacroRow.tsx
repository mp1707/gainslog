import React from 'react';
import { View, Text } from 'react-native';
import { FoodLog } from '@/types';
import { styles } from './MacroRow.styles';

interface MacroRowProps {
  foodLog: FoodLog;
}

export const MacroRow: React.FC<MacroRowProps> = ({ foodLog }) => {
  return (
    <View style={styles.container}>
      <View style={styles.macroItem}>
        <Text style={styles.label}>P:</Text>
        <Text style={styles.value}>{foodLog.protein}</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.label}>C:</Text>
        <Text style={styles.value}>{foodLog.carbs}</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.label}>F:</Text>
        <Text style={styles.value}>{foodLog.fat}</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.label}>Cal:</Text>
        <Text style={styles.value}>{foodLog.calories}</Text>
      </View>
    </View>
  );
};
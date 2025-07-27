import React from 'react';
import { View } from 'react-native';
import { FoodLog } from '@/types';
import { AppText } from '../../../../components/AppText';
import { useTheme } from '../../../../providers/ThemeProvider';
import { createStyles } from './MacroRow.styles';

interface MacroRowProps {
  foodLog: FoodLog;
}

export const MacroRow: React.FC<MacroRowProps> = ({ foodLog }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View 
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Nutrition: ${foodLog.protein}g protein, ${foodLog.carbs}g carbs, ${foodLog.fat}g fat, ${foodLog.calories} calories`}
    >
      <View style={styles.macroItem}>
        <AppText role="Caption" color="secondary" style={styles.label}>P:</AppText>
        <AppText role="Caption" color="primary" style={styles.value}>
          {foodLog.protein}g
        </AppText>
      </View>
      <View style={styles.macroItem}>
        <AppText role="Caption" color="secondary" style={styles.label}>C:</AppText>
        <AppText role="Caption" color="primary" style={styles.value}>
          {foodLog.carbs}g
        </AppText>
      </View>
      <View style={styles.macroItem}>
        <AppText role="Caption" color="secondary" style={styles.label}>F:</AppText>
        <AppText role="Caption" color="primary" style={styles.value}>
          {foodLog.fat}g
        </AppText>
      </View>
      <View style={styles.macroItem}>
        <AppText role="Caption" color="secondary" style={styles.label}>Cal:</AppText>
        <AppText role="Caption" color="primary" style={styles.value}>
          {foodLog.calories}
        </AppText>
      </View>
    </View>
  );
};
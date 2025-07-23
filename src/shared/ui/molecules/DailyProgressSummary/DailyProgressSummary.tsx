import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './DailyProgressSummary.styles';
import { DailyProgress } from '../../../../types';

interface DailyProgressSummaryProps {
  progress: DailyProgress;
}

export function DailyProgressSummary({ progress }: DailyProgressSummaryProps) {
  return (
    <View style={styles.container}>
      {/* Protein Progress */}
      <View style={styles.macroItem}>
        <Text style={styles.macroLabel}>Protein</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(100, progress.percentages.protein)}%` }
            ]} 
          />
        </View>
        <Text style={styles.macroValue}>
          {Math.round(progress.current.protein)}g
        </Text>
      </View>

      {/* Calories Display */}
      <View style={styles.caloriesItem}>
        <Text style={styles.caloriesLabel}>Calories</Text>
        <Text style={styles.caloriesValue}>
          {Math.round(progress.current.calories)}/{progress.targets.calories}
        </Text>
      </View>
    </View>
  );
}
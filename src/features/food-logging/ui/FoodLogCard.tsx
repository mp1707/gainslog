import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Badge, MacroRow } from '@/shared/ui';
import { FoodLog } from '../../../types';
import { styles } from './FoodLogCard.styles';

interface FoodLogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogCard: React.FC<FoodLogCardProps> = ({
  foodLog,
  onAddInfo,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <Text 
            style={[
              styles.title,
              foodLog.estimationConfidence === 0 && styles.loadingTitle
            ]}
          >
            {foodLog.imageUrl && '📷 '}{foodLog.userTitle || foodLog.generatedTitle}
          </Text>
          {foodLog.userDescription && (
            <Text style={styles.description}>
              {foodLog.userDescription}
            </Text>
          )}
        </View>
        <View style={styles.rightSection}>
          <Badge 
            confidence={foodLog.estimationConfidence} 
            isLoading={foodLog.estimationConfidence === 0} 
          />
          <TouchableOpacity
            style={styles.addInfoButton}
            onPress={() => onAddInfo(foodLog)}
          >
            <Text style={styles.addInfoButtonText}>Add Info</Text>
          </TouchableOpacity>
        </View>
      </View>
      <MacroRow foodLog={foodLog} />
    </View>
  );
};
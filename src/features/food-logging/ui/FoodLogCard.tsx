import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Badge, MacroRow } from '@/shared/ui';
import { FoodLog } from '../../../types';
import { styles } from './FoodLogCard.styles';
import { icons } from '../../../theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface FoodLogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogCard: React.FC<FoodLogCardProps> = ({
  foodLog,
  onAddInfo,
}) => {
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };

  return (
    <Pressable 
      style={styles.card} 
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`Food log: ${foodLog.userTitle || foodLog.generatedTitle}`}
      accessibilityHint="Tap to edit or add more information"
      android_ripple={{ color: 'rgba(0, 122, 255, 0.1)' }}
    >
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <Text 
            style={[
              styles.title,
              foodLog.estimationConfidence === 0 && styles.loadingTitle
            ]}
          >
            {foodLog.imageUrl && (
              <FontAwesome 
                name={icons.semantic.actions.camera} 
                size={icons.sizes.sm} 
                color={styles.title.color}
                style={styles.cameraIcon}
              />
            )}
            {foodLog.imageUrl && " "}
            {foodLog.userTitle || foodLog.generatedTitle}
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
        </View>
      </View>
      <MacroRow foodLog={foodLog} />
    </Pressable>
  );
};
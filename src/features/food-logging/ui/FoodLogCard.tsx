import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera } from 'phosphor-react-native';
import { Badge, MacroRow } from '@/shared/ui';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { FoodLog } from '../../../types';
import { useTheme } from '../../../providers/ThemeProvider';
import { createStyles } from './FoodLogCard.styles';

interface FoodLogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogCard: React.FC<FoodLogCardProps> = ({
  foodLog,
  onAddInfo,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };

  return (
    <Pressable 
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`Food log: ${foodLog.userTitle || foodLog.generatedTitle}`}
      accessibilityHint="Tap to edit or add more information"
      android_ripple={{ color: 'rgba(255, 122, 90, 0.1)' }}
    >
      <Card style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <View style={styles.titleWithIcon}>
              {foodLog.imageUrl && (
                <Camera 
                  size={16} 
                  color={colors.accent}
                  weight="regular"
                  style={styles.cameraIcon}
                />
              )}
              <AppText 
                role="Headline"
                style={[
                  styles.title,
                  foodLog.estimationConfidence === 0 && styles.loadingTitle
                ]}
              >
                {foodLog.userTitle || foodLog.generatedTitle}
              </AppText>
            </View>
            {foodLog.userDescription && (
              <AppText role="Body" color="secondary" style={styles.description}>
                {foodLog.userDescription}
              </AppText>
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
      </Card>
    </Pressable>
  );
};
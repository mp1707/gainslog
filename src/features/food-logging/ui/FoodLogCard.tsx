import React, { useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera } from 'phosphor-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  Easing 
} from 'react-native-reanimated';
import { Badge, MacroRow } from '@/shared/ui';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/AppText';
import { FoodLog } from '../../../types';
import { useTheme } from '../../../providers/ThemeProvider';
import { createStyles } from './FoodLogCard.styles';
import { FoodLogCardSkeleton } from './FoodLogCardSkeleton';

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
  
  // Loading state detection
  const isLoading = foodLog.estimationConfidence === 0;
  
  // Animation for flash effect and scaling when estimation completes
  const flashOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const prevConfidence = useRef(foodLog.estimationConfidence);
  
  // Press animation shared values
  const pressScale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);
  
  // Get color based on confidence level (matching Badge component logic)
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#10b981'; // Green
    if (confidence >= 60) return '#f59e0b'; // Amber
    if (confidence >= 40) return '#ef4444'; // Red
    return colors.secondaryText; // Uncertain (gray)
  };
  
  const flashColor = getConfidenceColor(foodLog.estimationConfidence);
  
  // Watch for estimation completion (confidence changes from 0 to positive)
  useEffect(() => {
    const currentConfidence = foodLog.estimationConfidence;
    const wasLoading = prevConfidence.current === 0;
    const isComplete = currentConfidence > 0;
    
    // Only animate when going from loading (0) to complete (>0)
    if (wasLoading && isComplete) {
      // Enhanced flash animation - slower, more luxurious timing
      flashOpacity.value = withSequence(
        withTiming(0.2, { duration: 300, easing: Easing.linear }),
        withTiming(0.08, { duration: 300, easing: Easing.linear }),
        withTiming(0, { duration: 900, easing: Easing.linear })
      );
      
      // Synchronized subtle scaling animation - slower and gentler
      cardScale.value = withSequence(
        withSpring(1.02, { damping: 25, stiffness: 250 }),
        withSpring(1.0, { damping: 30, stiffness: 350 })
      );
    }
    
    // Update previous confidence for next render
    prevConfidence.current = currentConfidence;
  }, [foodLog.estimationConfidence, flashOpacity, cardScale]);
  
  // Animated styles for flash overlay and card scaling
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    backgroundColor: flashColor,
  }));
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value * pressScale.value }],
  }));
  
  // Press animation styles
  const pressFlashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressFlashOpacity.value,
    backgroundColor: colors.primaryText,
  }));
  
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };

  const handlePressIn = () => {
    // Press down animation - scale down and flash
    pressScale.value = withTiming(0.97, { duration: 150, easing: Easing.out(Easing.quad) });
    pressFlashOpacity.value = withTiming(0.08, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    // Release animation - spring back and fade flash
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
    pressFlashOpacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
  };

  return (
    <Pressable 
      onPress={handleCardPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Food log: ${foodLog.userTitle || foodLog.generatedTitle}`}
      accessibilityHint="Tap to edit or add more information"
      android_ripple={{ color: 'rgba(255, 122, 90, 0.1)' }}
    >
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        {isLoading ? (
          <FoodLogCardSkeleton foodLog={foodLog} />
        ) : (
          <>
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
                      style={styles.title}
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
                    isLoading={false} 
                  />
                </View>
              </View>
              <MacroRow foodLog={foodLog} />
            </Card>
            
            {/* Flash overlay for success animation */}
            <Animated.View 
              style={[styles.flashOverlay, flashAnimatedStyle]}
              pointerEvents="none"
            />
            
            {/* Press flash overlay for press feedback */}
            <Animated.View 
              style={[styles.flashOverlay, pressFlashAnimatedStyle]}
              pointerEvents="none"
            />
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};
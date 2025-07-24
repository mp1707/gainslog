import React, { useCallback, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { styles } from './NutritionSlider.styles';

interface NutritionSliderProps {
  label: string;
  unit: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}

export function NutritionSlider({
  label,
  unit,
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  onSlidingComplete,
}: NutritionSliderProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleValueChange = useCallback((newValue: number) => {
    // Subtle fade animation when value changes
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(newValue);
  }, [onValueChange, fadeAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.value}>
            {Math.round(value)} {unit}
          </Text>
        </Animated.View>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={value}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          onValueChange={handleValueChange}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#E5E5E7"
          thumbTintColor="#007AFF"
          tapToSeek={true}
        />
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>
            {minimumValue} {unit}
          </Text>
          <Text style={styles.rangeLabel}>
            {maximumValue} {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}
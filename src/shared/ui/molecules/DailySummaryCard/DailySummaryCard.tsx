import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DailyTargets } from '../../../../types';
import { styles } from './DailySummaryCard.styles';

interface DailySummaryCardProps {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: DailyTargets;
  onPress: () => void;
}

export function DailySummaryCard({ date, totals, targets, onPress }: DailySummaryCardProps) {
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    if (dateStr === todayStr) {
      return `${date.getDate()}. ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    } else if (dateStr === yesterdayStr) {
      return `${date.getDate()}. ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    } else {
      return `${date.getDate()}. ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
    }
  };

  // Check if target is met for each nutrient
  const isCaloriesMet = totals.calories >= targets.calories;
  const isProteinMet = totals.protein >= targets.protein;
  const isCarbsMet = totals.carbs >= targets.carbs;
  const isFatMet = totals.fat >= targets.fat;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.dateText}>{formatDate(date)}</Text>
      
      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={[styles.label, { color: isProteinMet ? styles.metColor.color : styles.notMetColor.color }]}>
            Protein:
          </Text>
          <Text style={[styles.value, { color: isProteinMet ? styles.metColor.color : styles.notMetColor.color }]}>
            {Math.round(totals.protein)}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={[styles.label, { color: isFatMet ? styles.metColor.color : styles.notMetColor.color }]}>
            Fat:
          </Text>
          <Text style={[styles.value, { color: isFatMet ? styles.metColor.color : styles.notMetColor.color }]}>
            {Math.round(totals.fat)}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={[styles.label, { color: isCarbsMet ? styles.metColor.color : styles.notMetColor.color }]}>
            Carbs:
          </Text>
          <Text style={[styles.value, { color: isCarbsMet ? styles.metColor.color : styles.notMetColor.color }]}>
            {Math.round(totals.carbs)}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <Text style={[styles.label, { color: isCaloriesMet ? styles.metColor.color : styles.notMetColor.color }]}>
            Calories:
          </Text>
          <Text style={[styles.value, { color: isCaloriesMet ? styles.metColor.color : styles.notMetColor.color }]}>
            {Math.round(totals.calories)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
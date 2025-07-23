import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../src/theme';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';
import { Button } from '../../src/shared/ui/atoms/Button';
import { TargetInput } from '../../src/shared/ui/molecules/TargetInput';
import { ProgressBar } from '../../src/shared/ui/molecules/ProgressBar';
import { ProgressRing } from '../../src/shared/ui/molecules/ProgressRing';

export default function SettingsTab() {
  const { 
    dailyTargets, 
    updateDailyTargets, 
    loadDailyTargets, 
    getDailyProgress,
    isLoadingTargets 
  } = useFoodLogStore();

  const [formTargets, setFormTargets] = useState({
    calories: dailyTargets.calories.toString(),
    protein: dailyTargets.protein.toString(),
    carbs: dailyTargets.carbs.toString(),
    fat: dailyTargets.fat.toString(),
  });

  const progress = getDailyProgress();

  useEffect(() => {
    loadDailyTargets();
  }, []);

  useEffect(() => {
    setFormTargets({
      calories: dailyTargets.calories.toString(),
      protein: dailyTargets.protein.toString(),
      carbs: dailyTargets.carbs.toString(),
      fat: dailyTargets.fat.toString(),
    });
  }, [dailyTargets]);

  const handleSaveTargets = async () => {
    try {
      const newTargets = {
        calories: parseFloat(formTargets.calories) || 0,
        protein: parseFloat(formTargets.protein) || 0,
        carbs: parseFloat(formTargets.carbs) || 0,
        fat: parseFloat(formTargets.fat) || 0,
      };

      // Validate targets
      if (newTargets.calories <= 0 || newTargets.protein <= 0 || 
          newTargets.carbs <= 0 || newTargets.fat <= 0) {
        Alert.alert('Invalid Input', 'All targets must be greater than 0');
        return;
      }

      await updateDailyTargets(newTargets);
      Alert.alert('Success', 'Daily targets updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update targets. Please try again.');
    }
  };

  if (isLoadingTargets) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.content}>
        {/* Daily Progress Section */}
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.proteinRingContainer}>
            <ProgressRing
              progress={progress.percentages.protein}
              current={progress.current.protein}
              target={progress.targets.protein}
              unit="g"
              label="Protein"
              size={120}
            />
          </View>
          
          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesText}>
              {Math.round(progress.current.calories)}/{progress.targets.calories}
            </Text>
            <Text style={styles.caloriesPercent}>
              {Math.round(progress.percentages.calories)}%
            </Text>
          </View>
        </View>

        {/* Progress Bars */}
        <View style={styles.progressBars}>
          <ProgressBar
            progress={progress.percentages.carbs}
            current={progress.current.carbs}
            target={progress.targets.carbs}
            unit="g"
            label="Carbs"
          />
          <ProgressBar
            progress={progress.percentages.fat}
            current={progress.current.fat}
            target={progress.targets.fat}
            unit="g"
            label="Fat"
          />
        </View>

        {/* Targets Section */}
        <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
        
        <View style={styles.targetsSection}>
          <TargetInput
            label="Calories"
            value={formTargets.calories}
            onChangeText={(text) => setFormTargets(prev => ({ ...prev, calories: text }))}
            unit="kcal"
            placeholder="2000"
          />
          
          <TargetInput
            label="Protein"
            value={formTargets.protein}
            onChangeText={(text) => setFormTargets(prev => ({ ...prev, protein: text }))}
            unit="g"
            placeholder="150"
          />
          
          <TargetInput
            label="Carbs"
            value={formTargets.carbs}
            onChangeText={(text) => setFormTargets(prev => ({ ...prev, carbs: text }))}
            unit="g"
            placeholder="250"
          />
          
          <TargetInput
            label="Fat"
            value={formTargets.fat}
            onChangeText={(text) => setFormTargets(prev => ({ ...prev, fat: text }))}
            unit="g"
            placeholder="65"
          />
        </View>

        <Button onPress={handleSaveTargets}>
          Save Targets
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 20,
    marginTop: 20,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  proteinRingContainer: {
    alignItems: 'center',
  },
  caloriesContainer: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  caloriesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  caloriesPercent: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  progressBars: {
    marginBottom: 20,
  },
  targetsSection: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
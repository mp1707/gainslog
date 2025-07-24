import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';
import { Button } from '../../src/shared/ui/atoms/Button';
import { TargetInput } from '../../src/shared/ui/molecules/TargetInput';

export default function SettingsTab() {
  const { 
    dailyTargets, 
    updateDailyTargets, 
    loadDailyTargets,
    isLoadingTargets 
  } = useFoodLogStore();

  const [formTargets, setFormTargets] = useState({
    calories: dailyTargets.calories.toString(),
    protein: dailyTargets.protein.toString(),
    carbs: dailyTargets.carbs.toString(),
    fat: dailyTargets.fat.toString(),
  });

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
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
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

            <Button shape="square" color="primary" size="small" onPress={handleSaveTargets}>
              Save Targets
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
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
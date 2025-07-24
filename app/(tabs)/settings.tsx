import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';
import { NutritionSlider } from '../../src/shared/ui/atoms/NutritionSlider';

export default function SettingsTab() {
  const { 
    dailyTargets, 
    updateDailyTargetsDebounced, 
    loadDailyTargets,
    isLoadingTargets 
  } = useFoodLogStore();

  useEffect(() => {
    loadDailyTargets();
  }, []);

  const handleSliderChange = (key: keyof typeof dailyTargets, value: number) => {
    const newTargets = {
      ...dailyTargets,
      [key]: value,
    };
    updateDailyTargetsDebounced(newTargets);
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

      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
          <Text style={styles.subtitle}>Adjust your daily nutrition goals with the sliders below</Text>
          
          <View style={styles.slidersSection}>
            <NutritionSlider
              label="Calories"
              unit="kcal"
              value={dailyTargets.calories}
              minimumValue={1000}
              maximumValue={5000}
              step={50}
              onValueChange={(value) => handleSliderChange('calories', value)}
            />
            
            <NutritionSlider
              label="Protein"
              unit="g"
              value={dailyTargets.protein}
              minimumValue={50}
              maximumValue={300}
              step={5}
              onValueChange={(value) => handleSliderChange('protein', value)}
            />
            
            <NutritionSlider
              label="Carbs"
              unit="g"
              value={dailyTargets.carbs}
              minimumValue={50}
              maximumValue={500}
              step={5}
              onValueChange={(value) => handleSliderChange('carbs', value)}
            />
            
            <NutritionSlider
              label="Fat"
              unit="g"
              value={dailyTargets.fat}
              minimumValue={20}
              maximumValue={150}
              step={5}
              onValueChange={(value) => handleSliderChange('fat', value)}
            />
          </View>
        </View>
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
  scrollView: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    marginBottom: 32,
    lineHeight: 20,
  },
  slidersSection: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
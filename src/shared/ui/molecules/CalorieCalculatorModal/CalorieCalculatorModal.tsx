import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stepper } from '../../atoms/Stepper/Stepper';
import { CalorieCalculationCard, CALCULATION_METHODS, CalorieCalculationMethod } from '../../atoms/CalorieCalculationCard';
import { calculateCalorieGoals, CalorieIntakeParams, ActivityLevel, Sex } from '../../../../utils/calculateCalories';
import { useStyles } from './CalorieCalculatorModal.styles';

interface CalorieCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: CalorieCalculationMethod, params: CalorieIntakeParams, activityLevel: ActivityLevel) => void;
  initialParams?: Partial<CalorieIntakeParams>;
  initialActivityLevel?: ActivityLevel;
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  visible,
  onClose,
  onSelectMethod,
  initialParams = {},
  initialActivityLevel = 'moderate',
}) => {
  const styles = useStyles();
  
  // Create a stable initial params object to prevent re-renders
  const stableInitialParams = useMemo(() => ({
    sex: 'male' as Sex,
    age: 30,
    weight: 70,
    height: 170,
    ...initialParams,
  }), [initialParams.sex, initialParams.age, initialParams.weight, initialParams.height]);
  
  const [params, setParams] = useState<CalorieIntakeParams>(stableInitialParams);
  const [selectedMethodId, setSelectedMethodId] = useState<ActivityLevel | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedMethodId(null);
      setParams(stableInitialParams);
    }
  }, [visible, stableInitialParams]);

  const handleMethodSelect = (method: CalorieCalculationMethod) => {
    onSelectMethod(method, params, method.id);
    onClose();
  };

  const updateParam = <K extends keyof CalorieIntakeParams>(key: K, value: CalorieIntakeParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const toggleSex = () => {
    setParams(prev => ({ ...prev, sex: prev.sex === 'male' ? 'female' : 'male' }));
  };

  const methods = Object.values(CALCULATION_METHODS);

  // Calculate calorie goals for each activity level
  const getCalorieGoalsForMethod = (activityLevel: ActivityLevel) => {
    return calculateCalorieGoals(params, activityLevel);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Calorie Calculator</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Info Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your details to calculate your daily calorie needs.
            </Text>

            {/* Sex Selection */}
            <View style={styles.methodsSection}>
              <Text style={styles.sectionTitle}>Biological Sex</Text>
              <TouchableOpacity
                onPress={toggleSex}
                style={styles.sexToggle}
                accessibilityRole="button"
                accessibilityLabel={`Current selection: ${params.sex}. Tap to toggle.`}
              >
                <Text style={styles.sexToggleText}>
                  {params.sex === 'male' ? 'Male' : 'Female'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Age Input */}
            <View style={styles.methodsSection}>
              <Text style={styles.sectionTitle}>Age (years)</Text>
              <View style={styles.stepperContainer}>
                <Stepper
                  value={params.age}
                  min={13}
                  max={120}
                  step={1}
                  onChange={(value) => updateParam('age', value)}
                />
              </View>
            </View>

            {/* Weight Input */}
            <View style={styles.methodsSection}>
              <Text style={styles.sectionTitle}>Weight (kg)</Text>
              <View style={styles.stepperContainer}>
                <Stepper
                  value={params.weight}
                  min={30}
                  max={300}
                  step={1}
                  onChange={(value) => updateParam('weight', value)}
                />
              </View>
              <Text style={styles.inputHint}>
                {params.weight}kg = {Math.round(params.weight * 2.205)}lbs
              </Text>
            </View>

            {/* Height Input */}
            <View style={styles.methodsSection}>
              <Text style={styles.sectionTitle}>Height (cm)</Text>
              <View style={styles.stepperContainer}>
                <Stepper
                  value={params.height}
                  min={100}
                  max={250}
                  step={1}
                  onChange={(value) => updateParam('height', value)}
                />
              </View>
              <Text style={styles.inputHint}>
                {params.height}cm = {Math.floor(params.height / 30.48)}'{Math.round((params.height % 30.48) / 2.54)}"
              </Text>
            </View>
          </View>

          {/* Activity Level Selection */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Choose Your Activity Level</Text>
            <Text style={styles.sectionSubtitle}>
              Select the option that best matches your lifestyle and exercise routine.
            </Text>
            
            {methods.map((method) => (
              <CalorieCalculationCard
                key={method.id}
                method={method}
                calorieGoals={getCalorieGoalsForMethod(method.id)}
                isSelected={selectedMethodId === method.id}
                onSelect={(selectedMethod) => {
                  setSelectedMethodId(selectedMethod.id);
                  // Add a small delay to show selection before closing
                  setTimeout(() => handleMethodSelect(selectedMethod), 150);
                }}
              />
            ))}
          </View>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              These recommendations are general guidelines based on the Mifflin-St Jeor equation. Consult with a nutritionist or healthcare provider for personalized advice.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
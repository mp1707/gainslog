import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Stepper } from '../../atoms/Stepper/Stepper';
import { ProteinCalculationCard, CALCULATION_METHODS, ProteinCalculationMethod } from '../../atoms/ProteinCalculationCard';
import { useStyles } from './ProteinCalculatorModal.styles';
import { 
  getProteinCalculatorParams, 
  saveProteinCalculatorParams 
} from '../../../../lib/storage';

interface ProteinCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: ProteinCalculationMethod, bodyWeight: number, calculatedProtein: number) => void;
  initialBodyWeight?: number;
}

export const ProteinCalculatorModal: React.FC<ProteinCalculatorModalProps> = ({
  visible,
  onClose,
  onSelectMethod,
  initialBodyWeight = 85,
}) => {
  const styles = useStyles();
  
  const [bodyWeight, setBodyWeight] = useState(initialBodyWeight);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isBodyWeightLoaded, setIsBodyWeightLoaded] = useState(false);

  // Load saved body weight when modal opens
  useEffect(() => {
    const loadSavedBodyWeight = async () => {
      if (visible && !isBodyWeightLoaded) {
        try {
          const savedBodyWeight = await getProteinCalculatorParams();
          // Use saved value, but allow initialBodyWeight to override if provided
          const finalBodyWeight = initialBodyWeight !== 70 ? initialBodyWeight : savedBodyWeight;
          setBodyWeight(finalBodyWeight);
          setIsBodyWeightLoaded(true);
        } catch (error) {
          console.error('Failed to load saved body weight:', error);
          setBodyWeight(initialBodyWeight);
          setIsBodyWeightLoaded(true);
        }
      }
    };

    if (visible) {
      setSelectedMethodId(null);
      loadSavedBodyWeight();
    } else {
      setIsBodyWeightLoaded(false);
    }
  }, [visible, initialBodyWeight, isBodyWeightLoaded]);

  // Save body weight to storage whenever it changes
  useEffect(() => {
    const saveBodyWeight = async () => {
      if (isBodyWeightLoaded) {
        try {
          await saveProteinCalculatorParams(bodyWeight);
        } catch (error) {
          console.error('Failed to save body weight:', error);
        }
      }
    };

    saveBodyWeight();
  }, [bodyWeight, isBodyWeightLoaded]);

  const getBodyWeightNumber = (): number => {
    return bodyWeight > 0 ? bodyWeight : 0;
  };

  const handleMethodSelect = (method: ProteinCalculationMethod) => {
    const weightNum = getBodyWeightNumber();
    if (weightNum > 0) {
      const calculatedProtein = Math.round((weightNum * method.multiplier) / 5) * 5;
      onSelectMethod(method, weightNum, calculatedProtein);
      onClose();
    }
  };

  const methods = Object.values(CALCULATION_METHODS);
  const currentWeight = getBodyWeightNumber();

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
          <Text style={styles.title}>Protein Calculator</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={100}
        >
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Body Weight Input Card */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Body Weight</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your body weight to calculate personalized protein recommendations
            </Text>
            <View style={styles.stepperContainer}>
              <Stepper
                value={bodyWeight}
                min={1}
                max={300}
                step={1}
                onChange={setBodyWeight}
              />
            </View>
            {currentWeight > 0 && (
              <Text style={styles.inputHint}>
                {currentWeight}kg = {Math.round(currentWeight * 2.205)}lbs
              </Text>
            )}
          </View>

          {/* Calculation Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Choose Your Goal</Text>
            <Text style={styles.sectionSubtitle}>
              Select the option that best matches your goal.
            </Text>
            
            {methods.map((method) => (
              <ProteinCalculationCard
                key={method.id}
                method={method}
                bodyWeight={currentWeight}
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
          {currentWeight > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerNote}>
                These recommendations are general guidelines. Consult with a nutritionist or healthcare provider for personalized advice.
              </Text>
            </View>
          )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
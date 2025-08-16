import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { StyleSheet } from "react-native";

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();

  const [age, setAge] = useState<number>(calculatorParams?.age || 30);

  // Update age when store changes
  useEffect(() => {
    if (calculatorParams?.age) {
      setAge(calculatorParams.age);
    }
  }, [calculatorParams?.age]);

  const handleAgeChange = (ageText: string) => {
    if (ageText === "") {
      return;
    }

    const newAge = parseInt(ageText, 10);
    if (!isNaN(newAge)) {
      setAge(newAge);
      
      const updatedParams = {
        sex: calculatorParams?.sex || "male",
        age: newAge,
        weight: calculatorParams?.weight || 85,
        height: calculatorParams?.height || 175,
      };
      setCalculatorParams(updatedParams);
    }
  };

  const handleContinue = async () => {
    if (age < 13 || age > 120) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/weight");
  };

  const isValidAge = age >= 13 && age <= 120;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={2}
          accessibilityLabel={`Calculator progress: step 2 of 6`}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How old are you?</Text>
          <Text style={styles.description}>
            Your age helps determine your baseline metabolic rate.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <NumericTextInput
              value={age.toString()}
              onChangeText={handleAgeChange}
              min={13}
              max={120}
              placeholder="30"
              accessibilityLabel="Age input"
              accessibilityHint="Enter your age between 13 and 120 years"
              extraLarge
              borderless
              integerOnly
              autoFocus
            />
            <Text style={styles.unitText}>years</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValidAge && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValidAge}
          accessibilityRole="button"
          accessibilityLabel="Continue to weight selection"
        >
          <Text
            style={[
              styles.continueButtonText,
              !isValidAge && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
          <CaretRightIcon
            size={20}
            color={isValidAge ? "#FFFFFF" : colors.disabledText}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AgeSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 32,
  },
  textSection: {
    paddingTop: 24,
    gap: 8,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: "Nunito-Bold",
    color: "#000000",
    textAlign: "center",
  },
  description: {
    fontSize: 17,
    fontFamily: "Nunito-Regular",
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: {
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  unitText: {
    fontSize: 17,
    fontFamily: "Nunito-SemiBold",
    color: "#666666",
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 64,
  },
  progressContainer: {
    padding: 16,
  },
  continueButton: {
    backgroundColor: "#FF7A5A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  continueButtonText: {
    fontSize: 17,
    fontFamily: "Nunito-SemiBold",
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 8,
  },
  continueButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  continueButtonTextDisabled: {
    color: "#999999",
  },
});

import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { styles } from "./Stepper.styles";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  min = 0,
  max = 10000,
  step = 1,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<TextInput>(null);

  // Sync internal input state when external value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(value));
    }
  }, [value, isEditing]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const handleMinus = () => {
    onChange(clamp(value - step));
  };

  const handlePlus = () => {
    onChange(clamp(value + step));
  };

  const confirmInput = () => {
    const numeric = parseInt(inputValue, 10);
    if (!isNaN(numeric)) {
      onChange(clamp(numeric));
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleMinus}
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          ref={inputRef}
          style={[styles.valueBox, styles.valueInput]}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="number-pad"
          returnKeyType="done"
          onBlur={confirmInput}
          onSubmitEditing={confirmInput}
          autoFocus
        />
      ) : (
        <TouchableOpacity
          style={styles.valueBox}
          onPress={() => setIsEditing(true)}
          accessibilityRole="button"
          accessibilityLabel="Edit value"
        >
          <Text style={styles.valueText}>{value}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handlePlus}
        accessibilityRole="button"
        accessibilityLabel="Increase value"
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

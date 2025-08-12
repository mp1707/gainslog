import React from "react";
import { View, Text } from "react-native";
import { TextInput } from "@/shared/ui/atoms";
import { styles } from "./TargetInput.styles";

interface TargetInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  placeholder?: string;
}

export function TargetInput({
  label,
  value,
  onChangeText,
  unit,
  placeholder,
}: TargetInputProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          accessibilityLabel={label}
          accessibilityHint={`Enter ${label} value`}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

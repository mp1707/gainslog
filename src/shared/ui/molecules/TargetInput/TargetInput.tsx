import React from "react";
import { View, Text } from "react-native";
import { TextInput } from "../../atoms/TextInput";
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
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

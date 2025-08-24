import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TextInputProps } from "src/types-legacy/indexLegacy";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FormField.styles";
import { TextInput } from "@/components/shared/TextInput";

interface FormFieldProps extends Omit<TextInputProps, "error"> {
  label: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  children?: React.ReactNode; // For inline elements like record button
  inputRef?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  readOnly = false,
  children,
  inputRef: externalInputRef,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const internalRef = useRef<any>(null);
  const inputRef = externalInputRef || internalRef;

  const handleLabelPress = () => {
    if (!readOnly && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View style={readOnly && styles.readOnlyContainer}>
      <TouchableOpacity onPress={handleLabelPress} disabled={readOnly}>
        <Text style={[styles.label, readOnly && styles.readOnlyLabel]}>
          {label}
          {required && " *"}
        </Text>
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          {...textInputProps}
          error={!!error}
          disabled={readOnly}
        />
        {children && <View style={styles.inlineElement}>{children}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

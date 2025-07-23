import React from 'react';
import { View, Text } from 'react-native';
import { TextInput } from '@/shared/ui/atoms';
import { TextInputProps } from '@/types';
import { styles } from './FormField.styles';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required && ' *'}
      </Text>
      <TextInput {...textInputProps} />
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};
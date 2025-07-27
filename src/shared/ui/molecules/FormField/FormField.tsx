import React from 'react';
import { View, Text } from 'react-native';
import { TextInput } from '@/shared/ui/atoms';
import { TextInputProps } from '@/types';
import { useTheme } from '../../../../providers/ThemeProvider';
import { createStyles } from './FormField.styles';

interface FormFieldProps extends Omit<TextInputProps, 'error'> {
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required && ' *'}
      </Text>
      <TextInput 
        {...textInputProps} 
        error={!!error}
      />
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};
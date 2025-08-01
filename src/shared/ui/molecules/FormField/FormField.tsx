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
  readOnly?: boolean;
  children?: React.ReactNode; // For inline elements like record button
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  readOnly = false,
  children,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, readOnly && styles.readOnlyContainer]}>
      <Text style={[styles.label, readOnly && styles.readOnlyLabel]}>
        {label}{required && ' *'}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput 
          {...textInputProps} 
          error={!!error}
          disabled={readOnly}
        />
        {children && (
          <View style={styles.inlineElement}>
            {children}
          </View>
        )}
      </View>
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};
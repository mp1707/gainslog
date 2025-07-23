import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { TextInputProps } from '@/types';
import { styles } from './TextInput.styles';

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  return (
    <RNTextInput
      style={[styles.base, multiline && styles.multiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      textAlignVertical={multiline ? 'top' : 'center'}
      numberOfLines={multiline ? 4 : 1}
    />
  );
};
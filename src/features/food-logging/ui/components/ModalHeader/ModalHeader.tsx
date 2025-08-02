import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ModalMode } from '@/types';
import { useStyles } from './ModalHeader.styles';

interface ModalHeaderProps {
  mode: ModalMode;
  isUploading?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  mode,
  isUploading = false,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancelButton}>
          Cancel
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {mode === 'create' ? 'Add Food Log' : 'Edit Food Log'}
      </Text>
      <TouchableOpacity 
        onPress={onSave}
        disabled={isUploading}
      >
        <Text style={[
          styles.saveButton,
          isUploading && styles.saveButtonDisabled
        ]}>
          {isUploading ? 'Uploading...' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
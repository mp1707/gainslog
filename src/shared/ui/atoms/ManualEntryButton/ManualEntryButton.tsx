import React from 'react';
import { View } from 'react-native';
import { Button } from '../Button';
import { styles } from './ManualEntryButton.styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ManualEntryButtonProps {
  onPress: () => void;
}

export const ManualEntryButton: React.FC<ManualEntryButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.button}>
      <Button
        onPress={onPress}
        variant="secondary"
        size="medium"
      >
        <FontAwesome name="pencil" size={24} color="white" />
      </Button>
    </View>
  );
};
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { createStyles } from './FloatingAction.styles';
import { ProgressActionButton } from '@/components/refine-page/ProgressActionButton';

interface FloatingActionProps {
  label?: string;
  disabled?: boolean;
  onPress: () => void;
  // Processing state drives the animated border/shimmer
  isProcessing?: boolean;
  // When true, briefly show a success checkmark pulse
  didSucceed?: boolean;
}

export const FloatingAction: React.FC<FloatingActionProps> = ({
  label = 'Recalculate Macros',
  disabled,
  onPress,
  isProcessing = false,
  didSucceed = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.floatingActionContainer}>
      <View style={styles.floatingAccessory}>
        <View style={styles.flex1MinWidth0}>
          <ProgressActionButton
            label={label}
            onPress={onPress}
            disabled={disabled}
            isProcessing={isProcessing}
            didSucceed={didSucceed}
          />
        </View>
      </View>
    </View>
  );
};

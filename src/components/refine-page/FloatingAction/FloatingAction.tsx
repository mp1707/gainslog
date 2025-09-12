import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { createStyles } from './FloatingAction.styles';

interface FloatingActionProps {
  label?: string;
  disabled?: boolean;
  onPress: () => void;
}

export const FloatingAction: React.FC<FloatingActionProps> = ({
  label = 'Estimate again',
  disabled,
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.floatingActionContainer}>
      <View style={styles.floatingAccessory}>
        <View style={styles.flex1MinWidth0}>
          <Button variant="primary" label={label} Icon={Sparkles} onPress={onPress} disabled={disabled} />
        </View>
      </View>
    </View>
  );
};


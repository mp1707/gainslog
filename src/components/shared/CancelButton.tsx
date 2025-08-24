import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XIcon} from 'phosphor-react-native';
import { useTheme } from '@/theme';

interface CancelButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  onPress,
  accessibilityLabel = "Cancel",
  accessibilityHint = "Close the calorie calculator and return to settings",
}) => {
  const { colors, theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonPressed: {
      backgroundColor: colors.disabledBackground,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <XIcon
        size={20}
        color={colors.secondaryText}
        weight="regular"
      />
    </Pressable>
  );
};
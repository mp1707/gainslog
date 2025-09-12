import React, { useCallback, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { LucideIcon, Check, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { createStyles } from './ProgressActionButton.styles';

interface Props {
  label?: string;
  Icon?: LucideIcon;
  disabled?: boolean;
  isProcessing?: boolean;
  didSucceed?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProgressActionButton: React.FC<Props> = ({
  label = 'Estimate again',
  Icon = Sparkles,
  disabled = false,
  isProcessing = false,
  didSucceed = false,
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  // Press feedback scale
  const pressScale = useSharedValue(1);
  // Idle subtle breathing scale when processing
  const idleScale = useSharedValue(1);
  const onPressIn = useCallback(() => {
    if (disabled || isProcessing) return;
    pressScale.value = withSpring(0.98, { stiffness: 400, damping: 30 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [disabled, isProcessing, pressScale]);
  const onPressOut = useCallback(() => {
    pressScale.value = withSpring(1, { stiffness: 400, damping: 30 });
  }, [pressScale]);

  // Fade content out while processing
  const contentOpacity = useSharedValue(1);
  useEffect(() => {
    contentOpacity.value = withTiming(isProcessing ? 0 : 1, { duration: 200 });
  }, [isProcessing, contentOpacity]);

  // Spinner rotation
  const rotate = useSharedValue(0);
  useEffect(() => {
    if (isProcessing) {
      rotate.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      rotate.value = 0;
    }
  }, [isProcessing, rotate]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  // Subtle pulsing halo while processing
  const halo = useSharedValue(0);
  useEffect(() => {
    if (isProcessing) {
      halo.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      halo.value = 0;
    }
  }, [isProcessing, halo]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + halo.value * 0.25,
    transform: [{ scale: 1 + halo.value * 0.08 }],
  }));

  // Success overlay pulse
  const success = useSharedValue(0);
  useEffect(() => {
    if (didSucceed) {
      success.value = withTiming(1, { duration: 150 });
      const t = setTimeout(() => {
        success.value = withTiming(0, { duration: 250 });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [didSucceed, success]);
  const successStyle = useAnimatedStyle(() => ({
    opacity: success.value,
    transform: [{ scale: 0.95 + success.value * 0.1 }],
  }));

  const animatedContainer = useAnimatedStyle(() => ({
    // Combine idle breathing scale with press scale
    transform: [{ scale: pressScale.value * idleScale.value }],
  }));

  // Subtle breathing scale using spring while processing
  useEffect(() => {
    if (isProcessing) {
      // Animate between 1.0 and 1.03 repeatedly
      idleScale.value = withRepeat(
        withTiming(1.03, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      idleScale.value = withSpring(1, { stiffness: 300, damping: 25 });
    }
  }, [isProcessing, idleScale]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || isProcessing }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => {
        if (!disabled && !isProcessing) onPress();
      }}
      style={[styles.container, (disabled && !isProcessing && !didSucceed) ? styles.disabled : null, animatedContainer]}
    >
      {/* Idle/Enabled content */}
      <Animated.View style={[styles.contentRow, { opacity: contentOpacity }]}>
        <Icon size={18} color={disabled ? colors.disabledText : colors.black} />
        <Animated.Text
          numberOfLines={1}
          style={[styles.label, { color: disabled ? colors.disabledText : colors.black }]}
        >
          {isProcessing ? 'Sharpening…' : label}
        </Animated.Text>
      </Animated.View>

      {/* Processing overlay: rotating ring + halo */}
      {isProcessing && (
        <Animated.View pointerEvents="none" style={[styles.absoluteFill, haloStyle]}> 
          <Animated.View style={[styles.spinnerRing, spinnerStyle]} />
        </Animated.View>
      )}

      {/* Success overlay: filled green with Check */}
      {didSucceed && (
        <Animated.View pointerEvents="none" style={[styles.absoluteFill, styles.successFill, successStyle]}> 
          <Check size={22} color={colors.black} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
};

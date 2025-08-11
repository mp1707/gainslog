import React, { useEffect, useMemo } from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { AppText } from "src/components";

export type AccordionItemProps = {
  title: string;
  subtitle?: string;
  accessibilityLabel: string;
  rightAccessory?: React.ReactNode;
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
  isFirst?: boolean;
  contentContainerStyle?: ViewStyle;
  children: React.ReactNode;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  accessibilityLabel,
  rightAccessory,
  disabled = false,
  expanded,
  onToggle,
  isFirst = false,
  contentContainerStyle,
  children,
}) => {
  const { colors, theme } = useTheme();

  // Animation values
  const heightAnimation = useSharedValue(0);
  const opacityAnimation = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  // Animation configuration using theme values
  const animationConfig = {
    duration: theme.animations.defaultTransition.duration,
    easing: Easing.out(Easing.quad),
  };

  // Trigger animation when expanded state changes
  useEffect(() => {
    if (expanded) {
      // If we already have a measurement, animate to it
      if (contentHeight.value > 0) {
        heightAnimation.value = withTiming(
          contentHeight.value,
          animationConfig
        );
      }
      opacityAnimation.value = withTiming(1, animationConfig);
    } else {
      heightAnimation.value = withTiming(0, animationConfig);
      opacityAnimation.value = withTiming(0, animationConfig);
    }
  }, [
    expanded,
    heightAnimation,
    opacityAnimation,
    contentHeight,
    animationConfig,
  ]);

  // Animated styles
  const animatedContentStyle = useAnimatedStyle(() => ({
    height: heightAnimation.value,
    opacity: opacityAnimation.value,
    overflow: "hidden",
  }));

  const containerStyle: ViewStyle = useMemo(
    () => ({
      backgroundColor: "transparent",
      opacity: disabled ? 0.5 : 1,
      position: "relative",
    }),
    [disabled]
  );

  const headerStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderTopWidth: isFirst ? 0 : 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: colors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...(contentContainerStyle || {}),
  };

  // Render function so we can mount the same content twice: once hidden for measurement, once visible for animation
  const renderContent = () => <View style={contentStyle}>{children}</View>;

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (disabled) return;
          onToggle();
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled }}
        accessibilityLabel={accessibilityLabel}
        style={headerStyle}
      >
        <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
          <AppText role="Headline" style={{ marginBottom: 4 }}>
            {title}
          </AppText>
          {!!subtitle && (
            <AppText role="Caption" color="secondary">
              {subtitle}
            </AppText>
          )}
        </View>
        {rightAccessory}
      </TouchableOpacity>

      {/* Hidden measurement container (renders off-screen to capture natural height) */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          opacity: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
        onLayout={(event) => {
          const measuredHeight = event.nativeEvent.layout.height;
          if (measuredHeight > 0 && measuredHeight !== contentHeight.value) {
            contentHeight.value = measuredHeight;
            if (expanded) {
              heightAnimation.value = withTiming(
                measuredHeight,
                animationConfig
              );
            }
          }
        }}
      >
        {renderContent()}
      </View>

      {/* Visible animated container */}
      <Animated.View style={animatedContentStyle}>
        {renderContent()}
      </Animated.View>
    </View>
  );
};

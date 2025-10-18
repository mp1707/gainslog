import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Settings, CalendarDays } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { createStyles, MENU_WIDTH, SPACING } from "./MenuPopover.styles";

interface MenuPopoverProps {
  visible: boolean;
  onClose: () => void;
  onSettingsPress: () => void;
  onCalendarPress: () => void;
  triggerRef: React.RefObject<View | null>;
}

interface TriggerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SCREEN_MARGIN = 12;

export const MenuPopover: React.FC<MenuPopoverProps> = ({
  visible,
  onClose,
  onSettingsPress,
  onCalendarPress,
  triggerRef,
}) => {
  const { colors, colorScheme, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shouldRender, setShouldRender] = useState(false);
  const [triggerFrame, setTriggerFrame] = useState<TriggerFrame | null>(null);
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      if (!triggerRef.current) {
        return;
      }

      triggerRef.current.measureInWindow((x, y, width, height) => {
        setTriggerFrame({ x, y, width, height });
        setShouldRender(true);
      });
    } else {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }

      hideTimeout.current = setTimeout(() => {
        setShouldRender(false);
        setTriggerFrame(null);
      }, 180);
    }
  }, [visible, triggerRef]);

  useEffect(() => {
    if (!shouldRender || !triggerFrame || !contentSize) {
      return;
    }

    if (visible) {
      // Calculate offset for transform origin effect
      const buttonCenterX = triggerFrame.x + triggerFrame.width / 2;
      const buttonCenterY = triggerFrame.y + triggerFrame.height / 2;

      // Calculate menu position (we need to compute where the menu will be)
      const menuHeight = contentSize.height;
      const triggerBottom = triggerFrame.y + triggerFrame.height;
      const triggerRight = triggerFrame.x + triggerFrame.width;

      const spaceBelow = windowHeight - triggerBottom - SCREEN_MARGIN;
      const shouldDisplayAbove = spaceBelow < menuHeight + SPACING;

      let menuTop: number;
      if (shouldDisplayAbove) {
        menuTop = Math.max(SCREEN_MARGIN, triggerFrame.y - menuHeight - SPACING);
      } else {
        menuTop = Math.min(
          windowHeight - menuHeight - SCREEN_MARGIN,
          triggerBottom + SPACING
        );
      }

      let menuRight = windowWidth - triggerRight;
      if (menuRight + MENU_WIDTH > windowWidth - SCREEN_MARGIN) {
        menuRight = SCREEN_MARGIN;
      }

      const menuLeft = windowWidth - menuRight - MENU_WIDTH;
      const menuCenterX = menuLeft + MENU_WIDTH / 2;
      const menuCenterY = menuTop + menuHeight / 2;

      // Calculate offset from menu center to button center
      const offsetX = buttonCenterX - menuCenterX;
      const offsetY = buttonCenterY - menuCenterY;

      // Set initial position offset
      translateX.value = offsetX;
      translateY.value = offsetY;

      // Animate to final position with smooth easing (no overshoot)
      const openDuration = 150;
      const openEasing = Easing.out(Easing.cubic);

      scale.value = withTiming(1, { duration: openDuration, easing: openEasing });
      opacity.value = withTiming(1, { duration: openDuration, easing: openEasing });
      translateX.value = withTiming(0, { duration: openDuration, easing: openEasing });
      translateY.value = withTiming(0, { duration: openDuration, easing: openEasing });
    } else {
      // Calculate the same offset for closing animation
      const buttonCenterX = triggerFrame.x + triggerFrame.width / 2;
      const buttonCenterY = triggerFrame.y + triggerFrame.height / 2;

      const menuHeight = contentSize.height;
      const triggerBottom = triggerFrame.y + triggerFrame.height;
      const triggerRight = triggerFrame.x + triggerFrame.width;

      const spaceBelow = windowHeight - triggerBottom - SCREEN_MARGIN;
      const shouldDisplayAbove = spaceBelow < menuHeight + SPACING;

      let menuTop: number;
      if (shouldDisplayAbove) {
        menuTop = Math.max(SCREEN_MARGIN, triggerFrame.y - menuHeight - SPACING);
      } else {
        menuTop = Math.min(
          windowHeight - menuHeight - SCREEN_MARGIN,
          triggerBottom + SPACING
        );
      }

      let menuRight = windowWidth - triggerRight;
      if (menuRight + MENU_WIDTH > windowWidth - SCREEN_MARGIN) {
        menuRight = SCREEN_MARGIN;
      }

      const menuLeft = windowWidth - menuRight - MENU_WIDTH;
      const menuCenterX = menuLeft + MENU_WIDTH / 2;
      const menuCenterY = menuTop + menuHeight / 2;

      const offsetX = buttonCenterX - menuCenterX;
      const offsetY = buttonCenterY - menuCenterY;

      // Animate back to button position with smooth easing
      const closeDuration = 100;
      const closeEasing = Easing.in(Easing.cubic);

      scale.value = withTiming(0.3, { duration: closeDuration, easing: closeEasing });
      opacity.value = withTiming(0, { duration: closeDuration, easing: closeEasing });
      translateX.value = withTiming(offsetX, { duration: closeDuration, easing: closeEasing });
      translateY.value = withTiming(offsetY, { duration: closeDuration, easing: closeEasing });
    }
  }, [visible, opacity, scale, translateX, translateY, shouldRender, triggerFrame, contentSize, windowWidth, windowHeight, theme]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContentSize((prev) => {
      if (!prev || prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  const popoverGeometry = useMemo(() => {
    if (!triggerFrame || !contentSize) {
      return null;
    }

    const height = contentSize.height;
    const triggerBottom = triggerFrame.y + triggerFrame.height;
    const triggerRight = triggerFrame.x + triggerFrame.width;

    // Calculate if menu should appear above or below
    const spaceBelow = windowHeight - triggerBottom - SCREEN_MARGIN;
    const shouldDisplayAbove = spaceBelow < height + SPACING;

    let top: number;
    if (shouldDisplayAbove) {
      top = Math.max(SCREEN_MARGIN, triggerFrame.y - height - SPACING);
    } else {
      top = Math.min(
        windowHeight - height - SCREEN_MARGIN,
        triggerBottom + SPACING
      );
    }

    // Right-align the menu, ensuring it doesn't go off-screen
    let right = windowWidth - triggerRight;
    if (right + MENU_WIDTH > windowWidth - SCREEN_MARGIN) {
      right = SCREEN_MARGIN;
    }

    return {
      top,
      right,
    };
  }, [contentSize, triggerFrame, windowHeight, windowWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onSettingsPress();
  }, [onClose, onSettingsPress]);

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onCalendarPress();
  }, [onClose, onCalendarPress]);

  const handleOverlayPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      transparent
      statusBarTranslucent
      visible
      onRequestClose={onClose}
    >
      <Pressable
        pointerEvents="box-only"
        style={StyleSheet.absoluteFill}
        onPress={handleOverlayPress}
      />

      {popoverGeometry ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.animatedWrapper,
            { top: popoverGeometry.top, right: popoverGeometry.right },
            animatedStyle,
          ]}
        >
          <View style={styles.menuContainer}>
            <BlurView
              tint={colorScheme === "dark" ? "dark" : "light"}
              intensity={colorScheme === "dark" ? 50 : 40}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
            <View onLayout={handleContentLayout} style={styles.content}>
              <Pressable
                style={styles.menuItem}
                onPress={handleSettingsPress}
                accessibilityLabel="Open settings"
                accessibilityRole="button"
              >
                <Settings size={24} color={colors.primaryText} />
                <AppText role="Subhead" color="primary">Settings</AppText>
              </Pressable>

              <View style={styles.separator} />

              <Pressable
                style={styles.menuItem}
                onPress={handleCalendarPress}
                accessibilityLabel="Open calendar"
                accessibilityRole="button"
              >
                <CalendarDays size={24} color={colors.primaryText} />
                <AppText role="Subhead" color="primary">Calendar</AppText>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.measureContainer} pointerEvents="none">
          <View onLayout={handleContentLayout} style={styles.content}>
            <View style={styles.menuItem}>
              <Settings size={24} color={colors.primaryText} />
              <AppText role="Subhead" color="primary">Settings</AppText>
            </View>

            <View style={styles.separator} />

            <View style={styles.menuItem}>
              <CalendarDays size={24} color={colors.primaryText} />
              <AppText role="Subhead" color="primary">Calendar</AppText>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

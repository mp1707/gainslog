import React, { useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Switch,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers";
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type NutrientFilterKey = "calories" | "protein" | "carbs" | "fat";

export interface FilterMenuModalProps {
  visible: boolean;
  onClose: () => void;
  filters: Record<NutrientFilterKey, boolean>;
  onToggle: (key: NutrientFilterKey) => void;
}

export const FilterMenuModal: React.FC<FilterMenuModalProps> = ({
  visible,
  onClose,
  filters,
  onToggle,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Bottom-sheet animation setup
  const START_OFFSET = 280;
  const translateY = useSharedValue(START_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const gestureDirection = useSharedValue<
    "unknown" | "vertical" | "horizontal"
  >("unknown");

  // Softer spring for subtle motion
  const springCfg = { damping: 24, stiffness: 180, mass: 1 };
  const closeThreshold = 120;
  const fastVelocity = 800;

  const animateIn = () => {
    translateY.value = START_OFFSET;
    backdropOpacity.value = withTiming(1, { duration: 160 });
    translateY.value = withSpring(0, springCfg);
  };

  const animateOutThenClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 120 });
    translateY.value = withTiming(START_OFFSET, { duration: 180 }, () =>
      runOnJS(onClose)()
    );
  };

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible]);

  const handleBackdropPress = () => {
    Haptics.selectionAsync();
    animateOutThenClose();
  };

  const renderRow = (key: NutrientFilterKey, label: string) => {
    const value = !!filters[key];
    const trueColor =
      key === "calories"
        ? colors.semantic?.calories || colors.accent
        : key === "protein"
        ? colors.semantic?.protein || colors.accent
        : key === "carbs"
        ? colors.semantic?.carbs || colors.accent
        : colors.semantic?.fat || colors.accent;
    return (
      <View key={key} style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={() => onToggle(key)}
          trackColor={{ false: colors.disabledBackground, true: trueColor }}
          thumbColor={colors.white}
          accessibilityRole="switch"
          accessibilityLabel={`Toggle ${label}`}
        />
      </View>
    );
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      gestureDirection.value = "unknown";
    },
    onActive: (event) => {
      const { translationX, translationY } = event;
      if (gestureDirection.value === "unknown") {
        if (Math.abs(translationY) > 12 || Math.abs(translationX) > 12) {
          if (Math.abs(translationY) > Math.abs(translationX)) {
            gestureDirection.value = "vertical";
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          } else {
            gestureDirection.value = "horizontal";
          }
        }
      }
      if (gestureDirection.value === "vertical") {
        // Only allow dragging downwards
        if (translationY >= 0) {
          translateY.value = translationY;
        }
      }
    },
    onEnd: (event) => {
      const { translationY, velocityY } = event;
      if (translationY > closeThreshold || velocityY > fastVelocity) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        backdropOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(START_OFFSET, { duration: 180 }, () =>
          runOnJS(onClose)()
        );
      } else {
        translateY.value = withSpring(0, springCfg);
      }
      gestureDirection.value = "unknown";
    },
    onFail: () => {
      gestureDirection.value = "unknown";
      translateY.value = withSpring(0, springCfg);
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={animateOutThenClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.backdrop,
              animatedBackdropStyle,
            ]}
          >
            <Pressable
              style={styles.backdropTouchable}
              onPress={handleBackdropPress}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            />
          </Animated.View>

          <View pointerEvents="none" style={styles.bottomUnderlay} />

          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Details shown</Text>
                <TouchableOpacity
                  onPress={animateOutThenClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {renderRow("calories", "Calories")}
              {renderRow("protein", "Protein")}
              {renderRow("carbs", "Carbs")}
              {renderRow("fat", "Fat")}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

function createStyles(colors: any, themeObj: any) {
  const { spacing, typography } = themeObj;
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    backdropTouchable: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.primaryBackground,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    bottomUnderlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: spacing.xl,
      backgroundColor: colors.primaryBackground,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
    },
    closeText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: colors.accent,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.disabledBackground,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    rowLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
    },
  });
}

import React, { useMemo, useEffect } from "react";
import {
  View,
  Platform,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { AppText } from "@/components/shared/AppText";
import { useAppStore } from "@/store/useAppStore";
import { formatDateToLocalString } from "@/utils/dateHelpers";
import { createStyles } from "./DatePickerModal.styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bottom sheet constants
const BOTTOM_SHEET_HEIGHT = 320;
const BACKDROP_OPACITY = 0.4;
const SPRING_CONFIG = {
  damping: 30,
  stiffness: 300,
  mass: 0.6,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};
const DISMISS_THRESHOLD = 0.3;

export const DatePickerModal: React.FC = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme, colorScheme), [colors, theme, colorScheme]);
  const { 
    selectedDate, 
    setSelectedDate, 
    isDatePickerVisible, 
    hideDatePicker 
  } = useAppStore();
  const insets = useSafeAreaInsets();

  // Animation values for bottom sheet
  const translateY = useSharedValue(BOTTOM_SHEET_HEIGHT + insets.bottom + 50);
  const backdropOpacity = useSharedValue(0);
  const isVisible = useSharedValue(false);

  // Animated styles for bottom sheet
  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Logic and animations
  const handleDateChange = (_: any, date?: Date) => {
    if (date) {
      Haptics.selectionAsync();
      setSelectedDate(formatDateToLocalString(date));
    }
    closeDatePicker();
  };

  const openDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isVisible.value = true;
    
    // Animate in
    backdropOpacity.value = withTiming(BACKDROP_OPACITY, { duration: 300 });
    translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const closeDatePicker = () => {
    const hideSheet = () => {
      hideDatePicker();
      isVisible.value = false;
    };

    // Animate out
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(
      BOTTOM_SHEET_HEIGHT + insets.bottom + 50,
      { duration: 250 },
      (finished) => {
        if (finished) {
          runOnJS(hideSheet)();
        }
      }
    );
  };

  // Pan gesture handler for interactive dismissal
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationY } = event.nativeEvent;
    
    if (translationY > 0) {
      // Add resistance when pulling beyond dismiss threshold
      const resistance = translationY > BOTTOM_SHEET_HEIGHT * DISMISS_THRESHOLD ? 0.3 : 1;
      translateY.value = Math.max(0, translationY * resistance);
      
      // Update backdrop opacity based on translation
      const progress = Math.max(0, Math.min(1, translationY / (BOTTOM_SHEET_HEIGHT * 0.8)));
      backdropOpacity.value = BACKDROP_OPACITY * (1 - progress);
    }
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationY, velocityY, state } = event.nativeEvent;
    
    if (state === State.END) {
      const shouldDismiss = 
        translationY > BOTTOM_SHEET_HEIGHT * DISMISS_THRESHOLD || 
        velocityY > 1000;
        
      if (shouldDismiss) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        closeDatePicker();
      } else {
        // Snap back to open position
        translateY.value = withSpring(0, SPRING_CONFIG);
        backdropOpacity.value = withTiming(BACKDROP_OPACITY, { duration: 200 });
      }
    }
  };

  // Effect to handle visibility changes from Zustand
  useEffect(() => {
    if (isDatePickerVisible) {
      openDatePicker();
    } else {
      // Reset position when closed from outside
      translateY.value = BOTTOM_SHEET_HEIGHT + insets.bottom + 50;
      backdropOpacity.value = 0;
    }
  }, [isDatePickerVisible, insets.bottom, translateY, backdropOpacity]);

  // Don't render if not visible
  if (!isDatePickerVisible) {
    return null;
  }

  return (
    <View style={styles.bottomSheetOverlay} pointerEvents="box-none">
      {/* Backdrop */}
      <AnimatedPressable
        style={[styles.bottomSheetBackdrop, animatedBackdropStyle]}
        onPress={closeDatePicker}
        accessibilityLabel="Close date picker"
        accessibilityRole="button"
      />
      
      {/* Bottom Sheet */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetY={8}
        failOffsetY={-5}
      >
        <Animated.View 
          style={[
            styles.bottomSheetContainer,
            { paddingBottom: insets.bottom },
            animatedSheetStyle
          ]}
        >
          {/* Handle indicator */}
          <View style={styles.sheetHandle} />
          
          {/* Sheet content */}
          <View style={styles.sheetContent}>
            <AppText role="Title2" style={styles.sheetTitle}>
              Select Date
            </AppText>
            
            <DateTimePicker
              value={new Date(selectedDate + "T00:00:00")}
              mode="date"
              display="inline"
              onChange={handleDateChange}
              maximumDate={new Date()}
              {...(Platform.OS === "ios" && {
                themeVariant: colorScheme,
                accentColor: colors.accent,
              })}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
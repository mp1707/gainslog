import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { CalendarDays } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DatePickerButton.styles";

// Create animated BlurView
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const DatePickerButton: React.FC = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(-50);
  const blurIntensity = useSharedValue(0);

  const animatedModalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: blurIntensity.value,
  }));

  const animateModalIn = useCallback(() => {
    blurIntensity.value = withSpring(25, { stiffness: 300, damping: 30 });
    modalOpacity.value = withSpring(1, { stiffness: 400, damping: 30 });
    modalTranslateY.value = withSpring(0, { stiffness: 400, damping: 30 });
  }, [blurIntensity, modalOpacity, modalTranslateY]);

  const animateModalOut = useCallback(() => {
    blurIntensity.value = withTiming(0, { duration: 250 });
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalTranslateY.value = withTiming(-50, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsModalVisible)(false);
      }
    });
  }, [blurIntensity, modalOpacity, modalTranslateY]);

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, []);

  const handleDatePickerChange = useCallback(
    (_event: any, newSelectedDate?: Date) => {
      animateModalOut();
      if (newSelectedDate) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Use local timezone to avoid date shifting
        const year = newSelectedDate.getFullYear();
        const month = String(newSelectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(newSelectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        setSelectedDate(dateString);
      }
    },
    [setSelectedDate, animateModalOut]
  );

  const handleModalClose = useCallback(() => {
    animateModalOut();
  }, [animateModalOut]);

  useEffect(() => {
    if (isModalVisible) {
      animateModalIn();
    }
  }, [isModalVisible, animateModalIn]);

  return (
    <>
      <Button
        onPress={handleCalendarPress}
        variant="secondary"
        icon={<CalendarDays size={18} color={colors.secondaryText} />}
        accessibilityLabel="Open date picker"
        grow={false}
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalBackdrop}>
          <AnimatedBlurView
            style={styles.blurContainer}
            animatedProps={animatedBlurProps}
            tint={colorScheme}
          >
            <TouchableOpacity
              style={styles.modalBackdropTouchable}
              activeOpacity={1}
              onPress={handleModalClose}
            >
              <Animated.View style={[styles.modalContent, animatedModalStyle]}>
                <DateTimePicker
                  value={new Date(selectedDate + "T00:00:00")}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={handleDatePickerChange}
                  maximumDate={new Date()}
                  {...(Platform.OS === "ios" && {
                    themeVariant: colorScheme,
                    textColor: colors.primaryText,
                    accentColor: colors.accent,
                  })}
                />
              </Animated.View>
            </TouchableOpacity>
          </AnimatedBlurView>
        </View>
      </Modal>
    </>
  );
};
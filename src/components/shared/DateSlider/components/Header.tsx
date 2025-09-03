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
import { CalendarDays, Settings } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { AppText } from "@/components";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./Header.styles";

// Create animated BlurView
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface HeaderProps {
  onDateChange: (date: string) => void;
}

// Smart date formatting function
const formatSelectedDateHeader = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset time components for comparison
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayDateOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );
  const inputDateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (inputDateOnly.getTime() === todayDateOnly.getTime()) {
    return "Today";
  } else if (inputDateOnly.getTime() === yesterdayDateOnly.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

export const Header: React.FC<HeaderProps> = ({ onDateChange }) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safePush } = useNavigationGuard();
  const { selectedDate } = useAppStore();
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

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  };

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
        onDateChange(dateString);
      }
    },
    [onDateChange, animateModalOut]
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
      <View style={styles.header}>
        <AppText role="Title2" style={styles.headerTitle}>
          {formatSelectedDateHeader(selectedDate)}
        </AppText>
        <View style={styles.headerButtonContainer}>
          <Button
            onPress={handleSettingsPress}
            variant="secondary"
            size="small"
            icon={<Settings size={16} color={colors.secondaryText} />}
            accessibilityLabel="Open settings"
            grow={false}
            style={{ width: 40, height: 40 }}
          />
          <Button
            onPress={handleCalendarPress}
            variant="secondary"
            icon={<CalendarDays size={18} color={colors.secondaryText} />}
            accessibilityLabel="Open date picker"
            grow={false}
          />
        </View>
      </View>

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

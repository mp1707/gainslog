import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  View,
  FlatList,
  Pressable,
  Dimensions,
  Modal,
  TouchableOpacity,
  Platform,
  Text,
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

// Create animated BlurView
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
import { AppText } from "@/components";
import { ProgressRings } from "@/components/shared/ProgressRings";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DateSlider.styles";
import { CalendarDays, Settings } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

interface DayData {
  date: string; // YYYY-MM-DD
  weekday: string; // Single letter: M, T, W, etc.
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS_TO_SHOW = 4; // 2 weeks before, current week, 1 week ahead

// Calculate dynamic item width to fit exactly 7 days on screen
const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING) / 7;

// Smart date formatting function
const formatSelectedDateHeader = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

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
  const tomorrowDateOnly = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
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
  } else if (inputDateOnly.getTime() === tomorrowDateOnly.getTime()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

interface DayItemProps {
  item: DayData;
  isSelected: boolean;
  onPress: (date: string) => void;
  styles: any;
}

const DayItem: React.FC<DayItemProps> = React.memo(
  ({ item, isSelected, onPress, styles }) => {
    const { colors } = useTheme();
    const today = new Date().toISOString().split("T")[0];
    const isToday = item.date === today;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemContainer,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
        onPress={() => onPress(item.date)}
        accessibilityLabel={`Select ${item.date}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.weekdayContainer,
            isSelected && styles.selectedWeekdayContainer,
          ]}
        >
          <Text
            style={[
              styles.weekdayText,
              isSelected && styles.selectedWeekdayText,
              isToday && { color: colors.accent, fontWeight: "800" },
            ]}
          >
            {item.weekday}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <ProgressRings
            percentages={item.percentages}
            size={45}
            strokeWidth={4}
            spacing={1}
            padding={1}
          />
        </View>
      </Pressable>
    );
  }
);

export const DateSlider = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, ITEM_WIDTH),
    [colors, theme]
  );
  const flatListRef = useRef<FlatList>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Reanimated values for modal animation
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(-50);
  const blurIntensity = useSharedValue(0);
  const { safePush } = useNavigationGuard();

  const { foodLogs, selectedDate, setSelectedDate, dailyTargets } =
    useAppStore();

  // Animated style for modal content
  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ translateY: modalTranslateY.value }],
    };
  });

  // Animated props for BlurView
  const animatedBlurProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
  });

  // Animation functions
  const animateModalIn = useCallback(() => {
    blurIntensity.value = withSpring(25, {
      stiffness: 300,
      damping: 30,
    });
    modalOpacity.value = withSpring(1, {
      stiffness: 400,
      damping: 30,
    });
    modalTranslateY.value = withSpring(0, {
      stiffness: 400,
      damping: 30,
    });
  }, [modalOpacity, modalTranslateY, blurIntensity]);

  const animateModalOut = useCallback(() => {
    blurIntensity.value = withTiming(0, { duration: 250 });
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalTranslateY.value = withTiming(-50, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsModalVisible)(false);
      }
    });
  }, [modalOpacity, modalTranslateY, blurIntensity]);

  // Memoize daily totals for performance
  const dailyTotalsByDate = useMemo(() => {
    const totals = new Map<
      string,
      { calories: number; protein: number; carbs: number; fat: number }
    >();
    foodLogs.forEach((log) => {
      const currentTotals = totals.get(log.logDate) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      currentTotals.calories += log.calories;
      currentTotals.protein += log.protein;
      currentTotals.carbs += log.carbs;
      currentTotals.fat += log.fat;
      totals.set(log.logDate, currentTotals);
    });
    return totals;
  }, [foodLogs]);

  // Generate date range for the slider - always start on Monday
  const dateRange = useMemo(() => {
    const today = new Date();
    // Find the Monday of the week that's (WEEKS_TO_SHOW - 1) weeks before today's week
    const todayWeekStart = new Date(today);
    const todayDayOfWeek = (today.getDay() + 6) % 7; // Convert to Monday=0 format
    todayWeekStart.setDate(today.getDate() - todayDayOfWeek);

    const startDate = new Date(todayWeekStart);
    startDate.setDate(todayWeekStart.getDate() - (WEEKS_TO_SHOW - 1) * 7);

    const dates: DayData[] = [];

    for (let i = 0; i < WEEKS_TO_SHOW * 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = currentDate.toISOString().split("T")[0];
      const weekdayIndex = (currentDate.getDay() + 6) % 7; // Convert to Monday=0 format

      // Use the memoized map for quick lookups
      const dailyTotals = dailyTotalsByDate.get(dateString) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      // Calculate percentages
      const percentages = {
        calories: dailyTargets?.calories
          ? (dailyTotals.calories / dailyTargets.calories) * 100
          : 0,
        protein: dailyTargets?.protein
          ? (dailyTotals.protein / dailyTargets.protein) * 100
          : 0,
        carbs: dailyTargets?.carbs
          ? (dailyTotals.carbs / dailyTargets.carbs) * 100
          : 0,
        fat: dailyTargets?.fat ? (dailyTotals.fat / dailyTargets.fat) * 100 : 0,
      };

      dates.push({
        date: dateString,
        weekday: WEEKDAY_LETTERS[weekdayIndex],
        percentages,
      });
    }

    return dates;
  }, [dailyTotalsByDate, dailyTargets]);

  // Calculate initial content offset to show the week containing selected date
  const initialContentOffset = useMemo(() => {
    const selectedDateIndex = dateRange.findIndex(
      (day) => day.date === selectedDate
    );
    if (selectedDateIndex >= 0) {
      // Find which week (0-based) the selected date is in
      const weekIndex = Math.floor(selectedDateIndex / 7);
      return weekIndex * ITEM_WIDTH * 7;
    }
    return 0;
  }, [dateRange, selectedDate]);

  const handleDateSelect = useCallback(
    (date: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const handleDatePickerChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      if (selectedDate) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Format date in local timezone to avoid date jumping
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;
        setSelectedDate(dateString);
      }
      // Close modal on both platforms after date selection
      animateModalOut();
    },
    [setSelectedDate, animateModalOut]
  );

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, []);

  // Trigger animation when modal becomes visible
  useEffect(() => {
    if (isModalVisible) {
      animateModalIn();
    }
  }, [isModalVisible, animateModalIn]);

  const handleModalClose = useCallback(() => {
    animateModalOut();
  }, [animateModalOut]);

  const renderDayItem = useCallback(
    ({ item }: { item: DayData }) => {
      const isSelected = item.date === selectedDate;

      return (
        <DayItem
          item={item}
          isSelected={isSelected}
          onPress={handleDateSelect}
          styles={styles}
        />
      );
    },
    [selectedDate, styles, handleDateSelect]
  );

  const keyExtractor = useCallback((item: DayData) => item.date, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );
  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  }, [safePush]);

  // Scroll to initial position after component mounts
  useEffect(() => {
    if (initialContentOffset > 0) {
      // Use requestAnimationFrame to ensure FlatList is fully mounted
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialContentOffset,
          animated: false,
        });
      });
    }
  }, [initialContentOffset]);

  return (
    <View style={styles.container}>
      {/* Header Section */}
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

      {/* Date Slider */}
      <View
        style={[
          styles.sliderContainer,
          { paddingHorizontal: HORIZONTAL_PADDING / 2 },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={dateRange}
          renderItem={renderDayItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH * 7} // Snap to weeks
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          initialNumToRender={14} // 2 weeks
          windowSize={3}
          removeClippedSubviews={true}
          contentContainerStyle={{}}
        />
      </View>

      {/* Date Picker Modal */}
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
                  value={(() => {
                    // Create date in local timezone to avoid date jumping
                    const [year, month, day] = selectedDate.split("-");
                    return new Date(
                      parseInt(year),
                      parseInt(month) - 1,
                      parseInt(day)
                    );
                  })()}
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
    </View>
  );
};

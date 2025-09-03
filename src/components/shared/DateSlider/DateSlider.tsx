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
  Dimensions,
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

// Create animated BlurView
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
import { DayData, DayItem } from "./components/DayItem";
import { Header } from "./components/Header";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DateSlider.styles";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS_TO_LOAD_AT_ONCE = 5;

// Calculate dynamic item width to fit exactly 7 days on screen
const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING) / 7;

export const DateSlider = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, ITEM_WIDTH),
    [colors, theme]
  );
  const flatListRef = useRef<FlatList>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(-50);
  const blurIntensity = useSharedValue(0);

  const { foodLogs, selectedDate, setSelectedDate, dailyTargets } =
    useAppStore();

  const [pastWeeksLoaded, setPastWeeksLoaded] = useState(WEEKS_TO_LOAD_AT_ONCE);
  const [isLoading, setIsLoading] = useState(false);

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

  const getMondayOfWeek = useCallback((date: Date): Date => {
    const dayOfWeek = (date.getDay() + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);
    return monday;
  }, []);

  const dateRange = useMemo(() => {
    const today = new Date();
    const currentWeekMonday = getMondayOfWeek(today);
    const dates: DayData[] = [];

    for (let weekOffset = -pastWeeksLoaded; weekOffset <= 0; weekOffset++) {
      const weekStartDate = new Date(currentWeekMonday);
      weekStartDate.setDate(currentWeekMonday.getDate() + weekOffset * 7);

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStartDate);
        currentDate.setDate(weekStartDate.getDate() + i);

        const dateString = currentDate.toISOString().split("T")[0];
        const weekdayIndex = (currentDate.getDay() + 6) % 7;

        const dailyTotals = dailyTotalsByDate.get(dateString) || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };

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
          fat: dailyTargets?.fat
            ? (dailyTotals.fat / dailyTargets.fat) * 100
            : 0,
        };

        dates.push({
          date: dateString,
          weekday: WEEKDAY_LETTERS[weekdayIndex],
          percentages,
        });
      }
    }
    return dates;
  }, [pastWeeksLoaded, dailyTotalsByDate, dailyTargets, getMondayOfWeek]);

  const handleDateSelect = useCallback(
    (date: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const handleDatePickerChange = useCallback(
    (_event: any, newSelectedDate?: Date) => {
      animateModalOut();
      if (newSelectedDate) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const dateString = newSelectedDate.toISOString().split("T")[0];
        setSelectedDate(dateString);

        const today = new Date();
        const newDate = new Date(dateString);
        const diffTime = today.getTime() - newDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.ceil(diffDays / 7);

        if (diffWeeks > pastWeeksLoaded) {
          setPastWeeksLoaded(diffWeeks + WEEKS_TO_LOAD_AT_ONCE);
        }
      }
    },
    [setSelectedDate, animateModalOut, pastWeeksLoaded]
  );

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      animateModalIn();
    }
  }, [isModalVisible, animateModalIn]);

  const handleModalClose = useCallback(() => {
    animateModalOut();
  }, [animateModalOut]);

  const renderDayItem = useCallback(
    ({ item }: { item: DayData }) => (
      <DayItem
        item={item}
        isSelected={item.date === selectedDate}
        onPress={handleDateSelect}
        styles={styles}
      />
    ),
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

  const handleScrollEnd = useCallback(
    (event: any) => {
      if (isLoading) return;

      const contentOffset = event.nativeEvent.contentOffset.x;
      if (contentOffset < ITEM_WIDTH * 7) {
        setIsLoading(true);
        const listRef = flatListRef.current;
        setPastWeeksLoaded((prev) => {
          const newWeeks = prev + WEEKS_TO_LOAD_AT_ONCE;
          setTimeout(() => {
            const newContentOffset =
              contentOffset + WEEKS_TO_LOAD_AT_ONCE * 7 * ITEM_WIDTH;
            listRef?.scrollToOffset({
              offset: newContentOffset,
              animated: false,
            });
            setIsLoading(false);
          }, 100);
          return newWeeks;
        });
      }
    },
    [isLoading]
  );

  useEffect(() => {
    const selectedDateIndex = dateRange.findIndex(
      (day) => day.date === selectedDate
    );

    if (selectedDateIndex !== -1) {
      const weekIndex = Math.floor(selectedDateIndex / 7);
      const offset = weekIndex * 7 * ITEM_WIDTH;

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset,
          animated: false,
        });
      });
    } else {
      // If selected date is not in range, scroll to the end (most recent date)
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [selectedDate, dateRange]);

  return (
    <View style={styles.container}>
      <Header onCalendarPress={handleCalendarPress} />

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
          snapToInterval={ITEM_WIDTH * 7}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          initialNumToRender={42} // Initial 6 weeks
          windowSize={5}
          removeClippedSubviews={true}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{}}
        />
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
    </View>
  );
};

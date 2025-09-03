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
const INITIAL_WEEKS_TO_LOAD = 3; // Current week + 2 weeks in the past
const BUFFER_WEEKS = 2; // Always maintain 2 weeks buffer

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
  
  // State for dynamic date range
  const [dateRange, setDateRange] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Helper function to generate date data for a given week
  const generateWeekData = useCallback((startDate: Date): DayData[] => {
    const dates: DayData[] = [];
    
    for (let i = 0; i < 7; i++) {
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
  
  // Get the Monday of a given date's week
  const getMondayOfWeek = useCallback((date: Date): Date => {
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0 format
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek);
    return monday;
  }, []);
  
  // Update existing dateRange data with new percentages
  const updateDateRangeData = useCallback(() => {
    setDateRange(prevRange => {
      return prevRange.map(item => {
        const dailyTotals = dailyTotalsByDate.get(item.date) || {
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
          fat: dailyTargets?.fat ? (dailyTotals.fat / dailyTargets.fat) * 100 : 0,
        };
        
        return {
          ...item,
          percentages,
        };
      });
    });
  }, [dailyTotalsByDate, dailyTargets]);
  
  // Initialize date range on first load
  useEffect(() => {
    if (dateRange.length === 0) {
      const today = new Date();
      const currentWeekMonday = getMondayOfWeek(today);
      
      const dates: DayData[] = [];
      
      // Load current week + 2 weeks in the past
      for (let weekOffset = -2; weekOffset <= 0; weekOffset++) {
        const weekStartDate = new Date(currentWeekMonday);
        weekStartDate.setDate(currentWeekMonday.getDate() + weekOffset * 7);
        dates.push(...generateWeekData(weekStartDate));
      }
      
      setDateRange(dates);
    }
  }, [dateRange.length, generateWeekData, getMondayOfWeek]);
  
  // Update dateRange when foodLogs or dailyTargets change (for progress rings)
  useEffect(() => {
    if (dateRange.length > 0) {
      updateDateRangeData();
    }
  }, [dailyTotalsByDate, dailyTargets, updateDateRangeData]);

  // Calculate initial content offset to show the week containing selected date
  const initialContentOffset = useMemo(() => {
    if (dateRange.length === 0) return 0;
    
    const selectedDateIndex = dateRange.findIndex(
      (day) => day.date === selectedDate
    );
    if (selectedDateIndex >= 0) {
      // Find which week (0-based) the selected date is in
      const weekIndex = Math.floor(selectedDateIndex / 7);
      return weekIndex * ITEM_WIDTH * 7;
    }
    
    // Fallback: if selectedDate not found, scroll to the current week (last week loaded)
    // Since we load current week + 2 past weeks, current week is at index 2
    const totalWeeks = Math.floor(dateRange.length / 7);
    return (totalWeeks - 1) * ITEM_WIDTH * 7;
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
  
  // Handle scroll end to detect when we need to load more weeks
  const handleScrollEnd = useCallback((event: any) => {
    if (isLoading || dateRange.length === 0) return;
    
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentWeekIndex = Math.round(contentOffset / (ITEM_WIDTH * 7));
    const totalWeeks = Math.floor(dateRange.length / 7);
    
    const today = new Date();
    const currentRealWeekMonday = getMondayOfWeek(today);
    
    // Check if we're at the beginning (oldest week) and need to load more past weeks
    if (currentWeekIndex === 0) {
      setIsLoading(true);
      
      const currentOldestDate = new Date(dateRange[0].date + "T00:00:00");
      const oldestWeekMonday = getMondayOfWeek(currentOldestDate);
      
      // Add one more week in the past
      const newWeekStartDate = new Date(oldestWeekMonday);
      newWeekStartDate.setDate(oldestWeekMonday.getDate() - 7);
      
      const newWeekData = generateWeekData(newWeekStartDate);
      
      setDateRange(prevRange => {
        // Check for duplicates before adding
        const existingDates = new Set(prevRange.map(item => item.date));
        const uniqueNewData = newWeekData.filter(item => !existingDates.has(item.date));
        
        if (uniqueNewData.length > 0) {
          return [...uniqueNewData, ...prevRange];
        }
        return prevRange;
      });
      
      // Adjust scroll position to maintain current view
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: ITEM_WIDTH * 7, // Scroll one week forward to maintain current view
          animated: false,
        });
        setIsLoading(false);
      }, 50);
    }
    
    // Check if we're at the end (newest week) and need to load more future weeks
    // But never load beyond the current real week
    else if (currentWeekIndex >= totalWeeks - 1) {
      const currentNewestDate = new Date(dateRange[dateRange.length - 1].date + "T00:00:00");
      const newestWeekMonday = getMondayOfWeek(currentNewestDate);
      
      // Only load future weeks if we're not already at the current real week
      if (newestWeekMonday.getTime() < currentRealWeekMonday.getTime()) {
        setIsLoading(true);
        
        // Add one more week in the future
        const newWeekStartDate = new Date(newestWeekMonday);
        newWeekStartDate.setDate(newestWeekMonday.getDate() + 7);
        
        const newWeekData = generateWeekData(newWeekStartDate);
        
        setDateRange(prevRange => {
          // Check for duplicates before adding
          const existingDates = new Set(prevRange.map(item => item.date));
          const uniqueNewData = newWeekData.filter(item => !existingDates.has(item.date));
          
          if (uniqueNewData.length > 0) {
            return [...prevRange, ...uniqueNewData];
          }
          return prevRange;
        });
        setIsLoading(false);
      }
    }
  }, [isLoading, dateRange, generateWeekData, getMondayOfWeek]);
  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  }, [safePush]);

  // Scroll to initial position after component mounts
  useEffect(() => {
    if (dateRange.length > 0 && selectedDate && initialContentOffset >= 0) {
      // Use requestAnimationFrame to ensure FlatList is fully mounted
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialContentOffset,
          animated: false,
        });
      });
    }
  }, [dateRange.length, selectedDate, initialContentOffset]);

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
          initialNumToRender={21} // 3 weeks initially
          windowSize={3}
          removeClippedSubviews={true}
          onMomentumScrollEnd={handleScrollEnd}
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

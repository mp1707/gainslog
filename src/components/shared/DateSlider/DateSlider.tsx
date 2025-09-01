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
} from "react-native";
import { AppText } from "@/components";
import { ProgressRings } from "@/components/shared/ProgressRings";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DateSlider.styles";
import { Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateSliderProps {
  // Note: Interface matches requirement but we'll use foodLogs from store
}

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
const HORIZONTAL_PADDING = 40;
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

export const DateSlider: React.FC<DateSliderProps> = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, ITEM_WIDTH),
    [colors, theme]
  );
  const flatListRef = useRef<FlatList>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const { foodLogs, selectedDate, setSelectedDate, dailyTargets } =
    useAppStore();

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

      // Calculate daily totals for this date
      const dayLogs = foodLogs.filter((log) => log.logDate === dateString);
      const dailyTotals = dayLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

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
  }, [foodLogs, dailyTargets]);

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
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const handleDatePickerChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setIsModalVisible(false);
      }
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split("T")[0];
        setSelectedDate(dateString);
      }
      if (Platform.OS === "ios") {
        // Keep modal open on iOS for better UX
      }
    },
    [setSelectedDate]
  );

  const handleCalendarPress = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const renderDayItem = useCallback(
    ({ item }: { item: DayData }) => {
      const isSelected = item.date === selectedDate;

      return (
        <Pressable
          style={styles.itemContainer}
          onPress={() => handleDateSelect(item.date)}
          accessibilityLabel={`Select ${item.date}`}
          accessibilityRole="button"
        >
          <AppText
            style={[
              styles.weekdayText,
              isSelected && styles.selectedWeekdayText,
            ]}
          >
            {item.weekday}
          </AppText>
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
            onPress={handleCalendarPress}
            variant="secondary"
            icon={<Calendar size={16} color={colors.secondaryText} />}
            accessibilityLabel="Open date picker"
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
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <View
            style={[
              styles.modalContent,
              {
                top: buttonLayout.y + buttonLayout.height + 8,
                right: 16,
              },
            ]}
          >
            <DateTimePicker
              value={new Date(selectedDate + "T00:00:00")}
              mode="date"
              display={Platform.OS === "ios" ? "compact" : "default"}
              onChange={handleDatePickerChange}
              maximumDate={new Date()}
              {...(Platform.OS === "ios" && {
                themeVariant: colorScheme,
                textColor: colors.primaryText,
                accentColor: colors.accent,
              })}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={handleModalClose}
                style={styles.closeButton}
              >
                <AppText style={styles.closeButtonText}>Done</AppText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

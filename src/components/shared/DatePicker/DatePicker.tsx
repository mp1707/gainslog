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
  FlatList,
  Dimensions,
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
import * as Haptics from "expo-haptics";

import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./DatePicker.styles";
import { CalendarGrid } from "./components/CalendarGrid";
import type { FoodLog } from "@/types/models";

// Create animated BlurView
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface MonthData {
  year: number;
  month: number;
  key: string;
}

interface DailyNutritionData {
  [dateKey: string]: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export const DatePicker: React.FC = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate, foodLogs, dailyTargets } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(-50);
  const blurIntensity = useSharedValue(0);

  // Get current selected date components
  const selectedDateObj = useMemo(() => new Date(selectedDate + "T00:00:00"), [selectedDate]);
  const currentYear = selectedDateObj.getFullYear();
  const currentMonth = selectedDateObj.getMonth() + 1;

  // Generate months array (6 months before and after current)
  const monthsData = useMemo((): MonthData[] => {
    const months: MonthData[] = [];
    const startDate = new Date(currentYear, currentMonth - 1 - 6, 1);
    
    for (let i = 0; i < 13; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      });
    }
    return months;
  }, [currentYear, currentMonth]);

  // Find initial scroll index
  const initialScrollIndex = useMemo(() => {
    return monthsData.findIndex(m => m.year === currentYear && m.month === currentMonth);
  }, [monthsData, currentYear, currentMonth]);

  // Calculate daily nutrition data from food logs
  const dailyNutritionData = useMemo((): DailyNutritionData => {
    const data: DailyNutritionData = {};
    
    foodLogs.forEach((log: FoodLog) => {
      if (!data[log.logDate]) {
        data[log.logDate] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      data[log.logDate].calories += log.calories;
      data[log.logDate].protein += log.protein;
      data[log.logDate].carbs += log.carbs;
      data[log.logDate].fat += log.fat;
    });
    
    return data;
  }, [foodLogs]);

  // Calculate percentages for progress rings
  const getDailyPercentages = useCallback((dateKey: string) => {
    const dayData = dailyNutritionData[dateKey];
    if (!dayData || !dailyTargets) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return {
      calories: dailyTargets.calories ? (dayData.calories / dailyTargets.calories) * 100 : 0,
      protein: dailyTargets.protein ? (dayData.protein / dailyTargets.protein) * 100 : 0,
      carbs: dailyTargets.carbs ? (dayData.carbs / dailyTargets.carbs) * 100 : 0,
      fat: dailyTargets.fat ? (dayData.fat / dailyTargets.fat) * 100 : 0,
    };
  }, [dailyNutritionData, dailyTargets]);

  // Animation functions
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

  // Event handlers
  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    animateModalOut();
  }, [animateModalOut]);

  const handleDateSelect = useCallback((dateKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(dateKey);
    animateModalOut();
  }, [setSelectedDate, animateModalOut]);

  // Modal animation effect
  useEffect(() => {
    if (isModalVisible) {
      animateModalIn();
    }
  }, [isModalVisible, animateModalIn]);

  // Render month item for FlatList
  const renderMonthItem = useCallback(({ item }: { item: MonthData }) => (
    <CalendarGrid
      year={item.year}
      month={item.month}
      selectedDate={selectedDate}
      getDailyPercentages={getDailyPercentages}
      onDateSelect={handleDateSelect}
      width={screenWidth}
    />
  ), [selectedDate, getDailyPercentages, handleDateSelect]);

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
                <FlatList
                  data={monthsData}
                  renderItem={renderMonthItem}
                  keyExtractor={(item) => item.key}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  initialScrollIndex={initialScrollIndex}
                  getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
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
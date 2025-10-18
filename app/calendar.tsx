import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { View, Dimensions, StyleSheet, ViewToken } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { Colors, Theme, useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { CalendarGrid } from "@/components/shared/DatePicker/components/CalendarGrid";
import {
  useOptimizedNutritionData,
  generateMonthKeys,
} from "@/hooks/useOptimizedNutritionData";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { DynamicRoundButton } from "@/components/shared/DynamicRoundButton";
import { useSafeRouter } from "@/hooks/useSafeRouter";

interface MonthData {
  year: number;
  month: number;
  key: string;
}

const { width: screenWidth } = Dimensions.get("window");

const HYDRATION_DELAY_MS = 40;

const getMonthKeyFromDateKey = (dateKey: string) => {
  const [year, month] = dateKey.split("-");
  return `${year}-${parseInt(month, 10)}`;
};

export default function Calendar() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate, foodLogs, dailyTargets } =
    useAppStore();
  const router = useSafeRouter();

  // Get current selected date components
  const selectedDateObj = useMemo(
    () => new Date(selectedDate + "T00:00:00"),
    [selectedDate]
  );
  const selectedYear = selectedDateObj.getFullYear();
  const selectedMonth = selectedDateObj.getMonth() + 1;
  const selectedMonthKey = useMemo(
    () => getMonthKeyFromDateKey(selectedDate),
    [selectedDate]
  );

  // Get actual current date for month generation
  const actualCurrentDate = useMemo(() => new Date(), []);
  const currentYear = actualCurrentDate.getFullYear();
  const currentMonth = actualCurrentDate.getMonth() + 1;

  // Generate months array (24 months before current, up to current month only)
  const monthsData = useMemo((): MonthData[] => {
    const months: MonthData[] = [];
    const startDate = new Date(currentYear, currentMonth - 1 - 24, 1);

    for (let i = 0; i < 25; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      });
    }
    return months;
  }, [currentYear, currentMonth]);

  const monthsIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    monthsData.forEach((month, index) => {
      map.set(month.key, index);
    });
    return map;
  }, [monthsData]);

  // Find initial scroll index (scroll to selected date's month)
  const initialScrollIndex = useMemo(() => {
    return monthsData.findIndex(
      (m) => m.year === selectedYear && m.month === selectedMonth
    );
  }, [monthsData, selectedYear, selectedMonth]);

  const safeInitialScrollIndex =
    initialScrollIndex >= 0 ? initialScrollIndex : 0;

  const initialMonthKey = useMemo(() => {
    return (
      monthsData[safeInitialScrollIndex]?.key ?? monthsData[0]?.key ?? null
    );
  }, [monthsData, safeInitialScrollIndex]);

  const [hydratedMonths, setHydratedMonths] = useState<Set<string>>(() => {
    const initialSet = new Set<string>();
    if (initialMonthKey) {
      initialSet.add(initialMonthKey);
    }
    return initialSet;
  });

  const hydratedMonthsRef = useRef(hydratedMonths);
  const hydrationTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    hydratedMonthsRef.current = hydratedMonths;
  }, [hydratedMonths]);

  const scheduleHydration = useCallback(
    (keys: Array<string | null | undefined>) => {
      keys.forEach((candidate) => {
        if (!candidate) {
          return;
        }

        if (
          hydratedMonthsRef.current.has(candidate) ||
          hydrationTimeoutsRef.current[candidate]
        ) {
          return;
        }

        hydrationTimeoutsRef.current[candidate] = setTimeout(() => {
          setHydratedMonths((prev) => {
            if (prev.has(candidate)) {
              return prev;
            }
            const next = new Set(prev);
            next.add(candidate);
            return next;
          });
          delete hydrationTimeoutsRef.current[candidate];
        }, HYDRATION_DELAY_MS);
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      Object.values(hydrationTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      hydrationTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!initialMonthKey) {
      return;
    }
    if (!hydratedMonthsRef.current.has(initialMonthKey)) {
      setHydratedMonths((prev) => {
        if (prev.has(initialMonthKey)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(initialMonthKey);
        return next;
      });
    }

    scheduleHydration([initialMonthKey]);
  }, [initialMonthKey, scheduleHydration]);

  // Generate relevant month keys for optimized nutrition data calculation
  const relevantMonths = useMemo(() => {
    return generateMonthKeys(currentYear, currentMonth, 24);
  }, [currentYear, currentMonth]);

  // Use optimized nutrition data hook
  const { getDailyPercentages } = useOptimizedNutritionData(
    foodLogs,
    dailyTargets,
    relevantMonths
  );

  const closeCalendar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    closeCalendar();
  }, [closeCalendar]);

  const handleDateSelect = useCallback(
    (dateKey: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(dateKey);
      closeCalendar();
    },
    [setSelectedDate, closeCalendar]
  );

  useEffect(() => {
    if (!selectedMonthKey || !monthsIndexMap.has(selectedMonthKey)) {
      return;
    }
    scheduleHydration([selectedMonthKey]);
  }, [selectedMonthKey, monthsIndexMap, scheduleHydration]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems || viewableItems.length === 0) {
        return;
      }

      const expandedKeys = new Set<string>();

      viewableItems.forEach((viewToken) => {
        const item = viewToken.item as MonthData | null;
        const monthKey = item?.key
          ? item.key
          : typeof viewToken.key === "string"
          ? viewToken.key
          : null;

        if (!monthKey) {
          return;
        }

        expandedKeys.add(monthKey);

        const monthIndex = monthsIndexMap.get(monthKey);
        if (monthIndex === undefined) {
          return;
        }

        if (monthIndex > 0) {
          expandedKeys.add(monthsData[monthIndex - 1].key);
        }

        if (monthIndex < monthsData.length - 1) {
          expandedKeys.add(monthsData[monthIndex + 1].key);
        }
      });

      scheduleHydration(Array.from(expandedKeys));
    },
    [monthsData, monthsIndexMap, scheduleHydration]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  // Render month item for FlatList
  const renderMonthItem = useCallback(
    ({ item }: { item: MonthData }) => {
      const isHydrated = hydratedMonths.has(item.key);

      return (
        <CalendarGrid
          year={item.year}
          month={item.month}
          selectedDate={selectedDate}
          getDailyPercentages={getDailyPercentages}
          onDateSelect={handleDateSelect}
          width={screenWidth}
          useSimplifiedRings={!isHydrated}
        />
      );
    },
    [selectedDate, getDailyPercentages, handleDateSelect, hydratedMonths]
  );

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.headerContainer}>
        <DynamicRoundButton
          variant="secondary"
          systemIcon="xmark"
          legacyIcon={X}
          onPress={handleCancel}
          accessibilityLabel="Close calendar"
          controlSize="small"
        />
      </View>
      <View style={styles.calendarContainer}>
        <FlatList
          data={monthsData}
          renderItem={renderMonthItem}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={safeInitialScrollIndex}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          extraData={hydratedMonths}
          bounces={false}
          overScrollMode="never"
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    calendarContainer: {
      flex: 1,
    },
    headerContainer: {
      width: "100%",
      alignItems: "flex-end",
      paddingTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
  });

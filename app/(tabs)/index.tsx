import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  StyleSheet,
  View,
  FlatList,
  ListRenderItem,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { useTheme } from "@/theme/ThemeProvider";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { FoodLog } from "@/types/models";
import { Toast } from "toastify-react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { DashboardHeader } from "@/components/daily-food-logs/DashboardHeader/DashboardHeader";
import { DateSlider } from "@/components/shared/DateSlider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<FoodLog>);

const HEADER_HEIGHT = 280;
const COMPACT_THRESHOLD = 100;

export default function TodayTab() {
  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const flatListRef = useRef<FlatList>(null);

  // Animation values
  const scrollY = useSharedValue(0);

  const {
    foodLogs,
    selectedDate,
    dailyTargets,
    deleteFoodLog,
    addFavorite,
    deleteFavorite,
    favorites,
  } = useAppStore();

  const todayFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => log.logDate === selectedDate).reverse();
  }, [foodLogs, selectedDate]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [todayFoodLogs.length]);

  const dailyTotals = useMemo(() => {
    return todayFoodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayFoodLogs]);

  const dailyPercentages = useMemo(() => {
    if (
      !dailyTargets ||
      !dailyTargets.calories ||
      !dailyTargets.protein ||
      !dailyTargets.carbs ||
      !dailyTargets.fat
    ) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: (dailyTotals.calories / dailyTargets.calories) * 100,
      protein: (dailyTotals.protein / dailyTargets.protein) * 100,
      carbs: (dailyTotals.carbs / dailyTargets.carbs) * 100,
      fat: (dailyTotals.fat / dailyTargets.fat) * 100,
    };
  }, [dailyTotals, dailyTargets]);

  const defaultTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const toggleFavorite = (foodLog: FoodLog) => {
    const isFavorite = favorites.some((favorite) => favorite.id === foodLog.id);
    if (isFavorite) {
      deleteFavorite(foodLog.id);
      Toast.error("Favorite removed");
    } else {
      addFavorite({ ...foodLog });
      Toast.success("Favorite added");
    }
  };

  const handleNavigateToDetailPage = (foodLog: FoodLog) => {
    safeNavigate(`/edit/${foodLog.id}`);
  };

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const keyExtractor = useCallback((item: FoodLog) => item.id, []);
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120, // Estimated LogCard height including gap
      offset: 120 * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<FoodLog> = useCallback(
    ({ item }) => (
      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <SwipeToFunctions
          onDelete={() => deleteFoodLog(item.id)}
          onFavorite={() => toggleFavorite(item)}
          onTap={() => handleNavigateToDetailPage(item)}
        >
          <LogCard foodLog={item} isLoading={item.isEstimating} />
        </SwipeToFunctions>
      </View>
    ),
    [
      deleteFoodLog,
      toggleFavorite,
      handleNavigateToDetailPage,
      theme.spacing.md,
    ]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <MaskedView
            style={styles.headerContainer}
            maskElement={
              <LinearGradient
                colors={["black", "black", "transparent"]}
                locations={[0, 0.7, 1]}
                style={{ flex: 1 }}
              />
            }
          >
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <DateSlider />
            </BlurView>
          </MaskedView>
          <AnimatedFlatList
            ref={flatListRef}
            data={todayFoodLogs}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              {
                paddingBottom: dynamicBottomPadding,
                marginTop: HEADER_HEIGHT - COMPACT_THRESHOLD,
              },
            ]}
            ListHeaderComponent={
              <View>
                <DashboardHeader
                  percentages={dailyPercentages}
                  targets={dailyTargets || defaultTargets}
                  totals={dailyTotals}
                  scrollY={scrollY}
                />
              </View>
            }
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            updateCellsBatchingPeriod={50}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      zIndex: 10,
    },
    blurContainer: {
      flex: 1,
    },
    scrollView: {
      paddingVertical: themeObj.spacing.md,
      flex: 1,
    },
    contentContainer: {
      gap: themeObj.spacing.md,
    },
    logsTitle: {
      paddingHorizontal: themeObj.spacing.md,
      marginTop: themeObj.spacing.lg,
      marginBottom: themeObj.spacing.sm,

      // --- NEW HIERARCHY STYLES ---
      ...themeObj.typography.Caption, // Use a smaller typography preset
      fontWeight: "600",
      color: colors.secondaryText,
      textTransform: "uppercase", // The key change for the "eyebrow" style
    },
  });
};

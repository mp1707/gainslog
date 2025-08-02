import React from "react";
import { View, ScrollView, Platform, TouchableOpacity } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  Layout,
  FadeInUp,
  useAnimatedStyle,
} from "react-native-reanimated";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SwipeToDelete, SkeletonCard, ExpandableFAB } from "@/shared/ui";
import { FoodLogCard } from "./FoodLogCard";
import { FoodLog } from "../../../types";
import { createStyles } from "./FoodLogScreen.styles";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { useTheme } from "../../../providers/ThemeProvider";
import { Card } from "../../../components/Card";
import { AppText } from "../../../components/AppText";
import { RadialProgressBar } from "../../../shared/ui/atoms/RadialProgressBar";

interface FoodLogScreenProps {
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
}) => {
  const {
    selectedDate,
    setSelectedDate,
    getDailyProgress,
    triggerManualLog,
    triggerCameraCapture,
    triggerLibraryCapture,
    triggerAudioCapture,
    getFilteredFoodLogs,
  } = useFoodLogStore();

  const { theme, colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const dailyProgress = getDailyProgress();

  // Helper function to convert Date to local date string (YYYY-MM-DD)
  const dateToLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateString = dateToLocalDateString(selectedDate);
      setSelectedDate(dateString);
    }
  };

  const navigateToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  };

  const navigateToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  };

  // Check if the selected date is today to disable next button
  const isToday = () => {
    const today = new Date();
    const todayString = dateToLocalDateString(today);
    return selectedDate === todayString;
  };

  // Prepare nutrition data
  const caloriesData = {
    current: Math.round(dailyProgress.current.calories),
    target: dailyProgress.targets.calories,
    unit: "",
    label: "Calories",
  };

  const proteinData = {
    current: Math.round(dailyProgress.current.protein),
    target: dailyProgress.targets.protein,
    unit: "g",
    label: "Protein",
  };

  const fatData = {
    current: Math.round(dailyProgress.current.fat),
    target: dailyProgress.targets.fat,
    unit: "g",
    label: "Fat",
  };

  const carbsData = {
    current: Math.round(dailyProgress.current.carbs),
    target: dailyProgress.targets.carbs,
    unit: "g",
    label: "Carbs",
  };

  // Animated style for calories progress bar
  const caloriesAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, dailyProgress.percentages.calories)}%`,
  }));

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  // Calculate dynamic bottom padding
  // Tab bar height + FAB spacing + extra clearance for comfortable scrolling
  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding =
    tabBarHeight + theme.spacing.lg + theme.spacing.md;

  const styles = createStyles(colors, dynamicBottomPadding);
  const filteredFoodLogs = getFilteredFoodLogs();

  const handleDeleteLog = async (logId: string) => {
    await onDeleteLog(logId);
  };

  const handleManualLog = () => {
    triggerManualLog();
  };

  const handleCameraLog = () => {
    triggerCameraCapture();
  };

  const handleLibraryLog = () => {
    triggerLibraryCapture();
  };

  const handleAudioLog = () => {
    triggerAudioCapture();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Sticky Date Picker Card */}
      <View
        style={{
          paddingHorizontal: theme.spacing.pageMargins.horizontal,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Card style={{ padding: theme.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={navigateToPreviousDay}
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.spacing.sm,
                backgroundColor: colors.secondaryBackground,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "rgba(0, 0, 0, 0.05)",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <CaretLeftIcon
                size={16}
                color={colors.secondaryText}
                weight="regular"
              />
            </TouchableOpacity>

            <View
              style={{
                flexShrink: 0,
                marginLeft: -10,
              }}
            >
              <DateTimePicker
                value={new Date(selectedDate)}
                mode="date"
                display={Platform.OS === "ios" ? "compact" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                {...(Platform.OS === "ios" && {
                  themeVariant: colorScheme,
                  textColor: colors.primaryText,
                  accentColor: colors.accent,
                })}
              />
            </View>

            <TouchableOpacity
              onPress={navigateToNextDay}
              style={[
                {
                  padding: theme.spacing.sm,
                  borderRadius: theme.spacing.sm,
                  backgroundColor: colors.secondaryBackground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "rgba(0, 0, 0, 0.05)",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 2,
                },
                isToday() && {
                  backgroundColor: colors.disabledBackground,
                  borderColor: colors.border,
                  opacity: 0.5,
                },
              ]}
              disabled={isToday()}
            >
              <CaretRightIcon
                size={16}
                color={isToday() ? colors.disabledText : colors.secondaryText}
                weight="regular"
              />
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nutrition Progress Card */}
        <Card style={{ padding: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.lg }}>
            {/* Calories Row */}
            <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  width: "100%",
                  paddingHorizontal: theme.spacing.sm,
                }}
              >
                <AppText role="Headline">{caloriesData.label}</AppText>
                <View style={{ width: "100%" }}>
                  <AppText
                    role="Headline"
                    style={{
                      textAlign: "center",
                      position: "absolute",
                      top: 1,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      textTransform: "capitalize",
                      zIndex: 1,
                    }}
                  >
                    {caloriesData.current} / {caloriesData.target} kcal
                  </AppText>
                  <View
                    style={{
                      width: "100%",
                      height: 24,
                      backgroundColor: colors.disabledBackground,
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                      justifyContent: "center",
                    }}
                  >
                    <Animated.View
                      style={[
                        {
                          height: "100%",
                          borderRadius: 12,
                          minWidth: 1,
                          position: "absolute",
                          left: 0,
                          top: 0,
                          backgroundColor: colors.accent,
                        },
                        caloriesAnimatedStyle,
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Macros Row */}
            <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingHorizontal: theme.spacing.md,
                }}
              >
                <RadialProgressBar
                  current={proteinData.current}
                  target={proteinData.target}
                  unit={proteinData.unit}
                  label={proteinData.label}
                  size={90}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingHorizontal: theme.spacing.md,
                }}
              >
                <RadialProgressBar
                  current={fatData.current}
                  target={fatData.target}
                  unit={fatData.unit}
                  label={fatData.label}
                  size={90}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingHorizontal: theme.spacing.md,
                }}
              >
                <RadialProgressBar
                  current={carbsData.current}
                  target={carbsData.target}
                  unit={carbsData.unit}
                  label={carbsData.label}
                  size={90}
                />
              </View>
            </View>
          </View>
        </Card>

        {isLoadingLogs ? (
          <Animated.View>
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay(i * 80)
                  .springify()
                  .damping(18)
                  .stiffness(150)}
                layout={Layout.springify().damping(18).stiffness(150).mass(1)}
              >
                <SkeletonCard />
              </Animated.View>
            ))}
          </Animated.View>
        ) : (
          filteredFoodLogs.map((log, index) => (
            <Animated.View
              key={log.id}
              entering={FadeInUp.delay(index * 80)
                .springify()
                .damping(18)
                .stiffness(150)}
              layout={Layout.springify().damping(18).stiffness(150).mass(1)}
            >
              <SwipeToDelete onDelete={() => handleDeleteLog(log.id)}>
                <FoodLogCard foodLog={log} onAddInfo={onAddInfo} />
              </SwipeToDelete>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Expandable Floating Action Button */}
      <ExpandableFAB
        onManualLog={handleManualLog}
        onCameraLog={handleCameraLog}
        onLibraryLog={handleLibraryLog}
        onAudioLog={handleAudioLog}
      />
    </SafeAreaView>
  );
};

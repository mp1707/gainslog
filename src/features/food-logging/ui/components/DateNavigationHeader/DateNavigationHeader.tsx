import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PageHeader } from "../../../../../shared/ui";
import { useTheme } from "../../../../../providers/ThemeProvider";
import { createStyles } from "./DateNavigationHeader.styles";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Badge } from "../../../../../shared/ui/atoms/Badge";
import { AppText } from "../../../../../components/AppText";
import type { DailyProgress } from "../../../../../types";

interface DateNavigationHeaderProps {
  selectedDate: string;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  isToday: boolean;
  // Mini summary controls
  miniVisible?: boolean;
  progress?: DailyProgress;
}

export const DateNavigationHeader: React.FC<DateNavigationHeaderProps> = ({
  selectedDate,
  onDateChange,
  onNavigatePrevious,
  onNavigateNext,
  isToday,
  miniVisible = false,
  progress,
}) => {
  const { theme, colors, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);

  // Animate mini summary visibility
  const visibility = useSharedValue(0);
  const [miniHeight, setMiniHeight] = React.useState(0);

  React.useEffect(() => {
    visibility.value = withTiming(miniVisible ? 1 : 0, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [miniVisible, miniHeight, visibility]);

  const animatedMiniStyle = useAnimatedStyle(() => {
    const opacity = visibility.value;
    const translateY = withTiming(
      interpolate(visibility.value, [0, 1], [-4, 0]),
      {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
    const height = withTiming(visibility.value * miniHeight, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    return { height, opacity, transform: [{ translateY }] } as const;
  }, [miniHeight]);

  return (
    <PageHeader>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onNavigatePrevious}
          style={styles.navigationButton}
        >
          <CaretLeftIcon
            size={16}
            color={colors.secondaryText}
            weight="regular"
          />
        </TouchableOpacity>

        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
            {...(Platform.OS === "ios" && {
              themeVariant: colorScheme,
              textColor: colors.primaryText,
              accentColor: colors.accent,
            })}
          />
        </View>

        <TouchableOpacity
          onPress={onNavigateNext}
          style={[
            styles.navigationButton,
            isToday && styles.navigationButtonDisabled,
          ]}
          disabled={isToday}
        >
          <CaretRightIcon
            size={16}
            color={isToday ? colors.disabledText : colors.secondaryText}
            weight="regular"
          />
        </TouchableOpacity>
      </View>

      {/* Animated mini summary row */}
      <Animated.View
        style={[styles.miniSummaryWrapper, animatedMiniStyle]}
        accessibilityRole="summary"
        accessibilityLabel="Daily progress mini summary"
      >
        <View
          style={styles.miniSummaryContent}
          onLayout={(e) => setMiniHeight(e.nativeEvent.layout.height)}
        >
          {!!progress && (
            <View style={styles.miniBadgesRow}>
              <Badge
                variant="semantic"
                semanticType="calories"
                label={`${Math.max(0, progress.percentages.calories)}%`}
              />
              <Badge
                variant="semantic"
                semanticType="protein"
                label={`${Math.max(0, progress.percentages.protein)}%`}
              />
              <Badge
                variant="semantic"
                semanticType="carbs"
                label={`${Math.max(0, progress.percentages.carbs)}%`}
              />
              <Badge
                variant="semantic"
                semanticType="fat"
                label={`${Math.max(0, progress.percentages.fat)}%`}
              />
            </View>
          )}
        </View>
      </Animated.View>
    </PageHeader>
  );
};

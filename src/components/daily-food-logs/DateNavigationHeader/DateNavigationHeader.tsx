import React, { useMemo } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PageHeader } from "@/components/shared/PageHeader";
import { useTheme } from "@/theme";
import { createStyles } from "./DateNavigationHeader.styles";
import { useAppStore } from "@/store/useAppStore";
import { formatDateToLocalString, navigateDate } from "@/utils/dateHelpers";

export const DateNavigationHeader = () => {
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate } = useAppStore();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(formatDateToLocalString(selectedDate));
    }
  };

  const handleNavigatePrevious = () => {
    setSelectedDate(navigateDate(selectedDate, "prev"));
  };

  const handleNavigateNext = () => {
    setSelectedDate(navigateDate(selectedDate, "next"));
  };

  const canGoNext = useMemo(() => {
    const today = new Date();
    const selected = new Date(selectedDate);
    return selected < today;
  }, [selectedDate]);

  return (
    <PageHeader>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleNavigatePrevious}
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
            value={new Date(selectedDate + "T00:00:00")}
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
          onPress={handleNavigateNext}
          style={[
            styles.navigationButton,
            !canGoNext && styles.navigationButtonDisabled,
          ]}
          disabled={!canGoNext}
        >
          <CaretRightIcon
            size={16}
            color={!canGoNext ? colors.disabledText : colors.secondaryText}
            weight="regular"
          />
        </TouchableOpacity>
      </View>
    </PageHeader>
  );
};

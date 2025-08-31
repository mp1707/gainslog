import React, { useMemo } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/theme";
import { createStyles } from "./DateNavigationHeader.styles";
import { useAppStore } from "@/store/useAppStore";
import { formatDateToLocalString, navigateDate } from "@/utils/dateHelpers";
import { Card } from "@/components/Card";
import { Button } from "@/components/shared/Button";

interface DateNavigationHeaderProps {
  compact?: boolean;
}

export const DateNavigationHeader = ({
  compact = false,
}: DateNavigationHeaderProps) => {
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

  if (compact) {
    return (
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
        style={styles.datepicker}
      />
    );
  }

  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.button}>
          <Button
            onPress={handleNavigatePrevious}
            variant="secondary"
            icon={
              <CaretLeftIcon
                size={16}
                color={colors.secondaryText}
                weight="regular"
              />
            }
          />
        </View>

        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={new Date(selectedDate + "T00:00:00")}
            mode="date"
            textColor={colors.primaryText}
            accentColor={colors.accent}
            themeVariant={colorScheme}
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

        <View style={styles.button}>
          <Button
            onPress={handleNavigateNext}
            variant="secondary"
            disabled={!canGoNext}
            icon={
              <CaretRightIcon
                size={16}
                color={!canGoNext ? colors.disabledText : colors.secondaryText}
                weight="regular"
              />
            }
          />
        </View>
      </View>
    </Card>
  );
};

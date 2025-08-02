import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { CaretLeftIcon, CaretRightIcon } from 'phosphor-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PageHeader } from '../../../../../shared/ui';
import { useTheme } from '../../../../../providers/ThemeProvider';
import { createStyles } from './DateNavigationHeader.styles';

interface DateNavigationHeaderProps {
  selectedDate: string;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  isToday: boolean;
}

export const DateNavigationHeader: React.FC<DateNavigationHeaderProps> = ({
  selectedDate,
  onDateChange,
  onNavigatePrevious,
  onNavigateNext,
  isToday,
}) => {
  const { theme, colors, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);

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
    </PageHeader>
  );
};
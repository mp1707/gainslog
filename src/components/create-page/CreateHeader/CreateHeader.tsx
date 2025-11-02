import React, { useCallback } from "react";
import { View } from "react-native";
import { X } from "lucide-react-native";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { useTheme } from "@/theme";
import { RoundButton } from "@/components/shared/RoundButton";
import { createStyles } from "./CreateHeader.styles";
import { useAppStore } from "@/store/useAppStore";
import { HeaderButton } from "@/components/shared/HeaderButton/HeaderButton.ios";

interface CreateHeaderProps {
  onCancel: () => void;
}

export const CreateHeader: React.FC<CreateHeaderProps> = ({ onCancel }) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);
  const { selectedDate, setSelectedDate } = useAppStore();

  const handleDateSelected = useCallback(
    (date: Date) => {
      // Convert Date object to YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setSelectedDate(formattedDate);
    },
    [setSelectedDate]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents colorScheme={colorScheme}>
          <DateTimePicker
            onDateSelected={handleDateSelected}
            displayedComponents="date"
            initialDate={selectedDate}
            variant="compact"
            color={colors.accent}
          />
        </Host>
        <HeaderButton
          buttonProps={{ onPress: onCancel }}
          imageProps={{ systemName: "xmark" }}
        />
      </View>
    </View>
  );
};

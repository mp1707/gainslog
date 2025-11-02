import React from "react";
import { ScrollView } from "react-native";
import { TextInput } from "@/components/shared/TextInput";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme/ThemeProvider";

const CreateTabScreen = () => {
  const { selectedDate, setSelectedDate } = useAppStore();
  const { colors } = useTheme();

  return (
    <ScrollView>
      <Host matchContents>
        <DateTimePicker
          onDateSelected={(date) => {
            setSelectedDate(date.toISOString());
          }}
          displayedComponents="date"
          initialDate={selectedDate}
          variant="compact"
          color={colors.accent}
        />
      </Host>
      <TextInput />
    </ScrollView>
  );
};

export default CreateTabScreen;

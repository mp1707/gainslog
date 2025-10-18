import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { DatePicker } from "@/components/shared/DatePicker";
import { DynamicRoundButton } from "@/components/shared/DynamicRoundButton";
import { createStyles } from "./CreateHeader.styles";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/formatDate";
import { X } from "lucide-react-native";

interface CreateHeaderProps {
  onCancel: () => void;
}

export const CreateHeader: React.FC<CreateHeaderProps> = ({ onCancel }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { selectedDate } = useAppStore();
  const formattedDate = formatDate(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppText role="Title2" style={styles.title}>
          {formattedDate}
        </AppText>
        <View style={styles.headerActions}>
          <DatePicker buttonVariant="tertiary" />
          <DynamicRoundButton
            variant="secondary"
            legacyIcon={X}
            systemIcon="xmark"
            onPress={onCancel}
            accessibilityLabel="Close create screen"
            controlSize="small"
          />
        </View>
      </View>
    </View>
  );
};

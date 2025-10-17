import React from "react";
import { View } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { DatePicker } from "@/components/shared/DatePicker";
import { IOSButton } from "@/components/shared/IOSButton";
import { createStyles } from "./CreateHeader.styles";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/formatDate";

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
          <IOSButton
            variant="glass"
            systemIcon="xmark"
            iconColor={colors.primaryText}
            onPress={onCancel}
            accessibilityLabel="Close create screen"
          />
        </View>
      </View>
    </View>
  );
};

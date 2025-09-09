import React from "react";
import { View } from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { Toggle } from "@/components/shared/Toggle";
import { DatePicker } from "@/components/shared/DatePicker";
import { RoundButton } from "@/components/shared/RoundButton";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";
import { createStyles } from "./CreateHeader.styles";

interface CreateHeaderProps {
  formattedDate: string;
  estimationType: "ai" | "favorites" | "manual";
  onEstimationTypeChange: (value: "ai" | "favorites" | "manual") => void;
  onCancel: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CreateHeader: React.FC<CreateHeaderProps> = ({
  formattedDate,
  estimationType,
  onEstimationTypeChange,
  onCancel,
  searchQuery,
  onSearchChange,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <AppText role="Title2">{formattedDate}</AppText>
        <View style={styles.headerActions}>
          <DatePicker buttonVariant="tertiary" />
          <RoundButton
            onPress={onCancel}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Close create screen"
          />
        </View>
      </View>
      
      <Toggle
        value={estimationType}
        options={[
          { label: "Estimation", value: "ai" },
          { label: "Favorites", value: "favorites" },
          { label: "Manual", value: "manual" },
        ]}
        onChange={onEstimationTypeChange}
      />
      
      {estimationType === "favorites" && (
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search favorites"
        />
      )}
    </View>
  );
};
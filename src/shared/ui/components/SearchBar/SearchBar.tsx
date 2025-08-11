import React from "react";
import { View } from "react-native";
import { MagnifyingGlassIcon } from "phosphor-react-native";
import { TextInput } from "@/shared/ui";
import { useTheme } from "@/providers/ThemeProvider";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { colors, theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
      }}
    >
      <MagnifyingGlassIcon size={18} color={colors.secondaryText} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || "Search"}
        accessibilityLabel="Search"
        accessibilityHint="Enter text to filter the list"
        style={{ flex: 1 }}
      />
    </View>
  );
};

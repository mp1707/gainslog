import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Microphone } from "phosphor-react-native";
import { useTheme } from "@/theme";
import { theme } from "@/theme";

interface EditableTextRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  showMicButton?: boolean;
  onMicPress?: () => void;
}

export const EditableTextRow: React.FC<EditableTextRowProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  showMicButton = false,
  onMicPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, multiline && styles.multilineContainer]}>
      <Text style={[styles.label, { color: colors.primaryText }]}>{label}</Text>
      <View style={[styles.inputContainer, multiline && styles.multilineInputContainer]}>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.primaryText,
            },
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          multiline={multiline}
          textAlign={multiline ? "left" : "right"}
        />
        {showMicButton && (
          <TouchableOpacity onPress={onMicPress} style={[styles.micButton, multiline && styles.multilineMicButton]}>
            <Microphone size={22} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    minHeight: 50,
  },
  multilineContainer: {
    alignItems: "flex-start",
    minHeight: 100,
    paddingVertical: theme.spacing.md,
  },
  label: {
    ...theme.typography.Body,
    flex: 1,
  },
  inputContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    ...theme.typography.Body,
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 60,
  },
  multilineInputContainer: {
    alignItems: "flex-start",
  },
  micButton: {
    paddingLeft: theme.spacing.sm,
  },
  multilineMicButton: {
    paddingTop: theme.spacing.sm,
  },
});
import React from "react";
import { View, TextInput as RNTextInput } from "react-native";
import { AppText, Button } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./StickyEditor.styles";

interface StickyEditorProps {
  tempName: string;
  tempAmount: string;
  setTempName: (v: string) => void;
  setTempAmount: (v: string) => void;
  focusNameOnAdd: boolean;
  nameFocused: boolean;
  amountFocused: boolean;
  setNameFocused: (v: boolean) => void;
  setAmountFocused: (v: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
}

export const StickyEditor: React.FC<StickyEditorProps> = ({
  tempName,
  tempAmount,
  setTempName,
  setTempAmount,
  focusNameOnAdd,
  nameFocused,
  amountFocused,
  setNameFocused,
  setAmountFocused,
  onCancel,
  onSave,
  saveDisabled,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.stickyContainer}>
      <View style={styles.stickyEditorPill}>
        <AppText role="Caption" style={styles.inlineLabel}>
          Name
        </AppText>
        <View
          style={[
            styles.focusWrapper,
            { borderColor: nameFocused ? colors.accent : "transparent" },
          ]}
        >
          <RNTextInput
            placeholder="Name"
            value={tempName}
            onChangeText={setTempName}
            placeholderTextColor={colors.secondaryText}
            autoFocus={focusNameOnAdd}
            keyboardAppearance={colorScheme}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={styles.input}
          />
        </View>
        <AppText role="Caption" style={styles.inlineLabel}>
          Amount
        </AppText>
        <View
          style={[
            styles.focusWrapper,
            { borderColor: amountFocused ? colors.accent : "transparent" },
          ]}
        >
          <RNTextInput
            placeholder="Amount (e.g., 150 g)"
            value={tempAmount}
            onChangeText={setTempAmount}
            placeholderTextColor={colors.secondaryText}
            autoFocus={!focusNameOnAdd}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            style={styles.input}
          />
        </View>
        <View style={styles.inlineActions}>
          <View style={styles.flex1}>
            <Button variant="tertiary" label="Cancel" onPress={onCancel} />
          </View>
          <View style={styles.flex1}>
            <Button
              variant="primary"
              label="Save"
              disabled={saveDisabled}
              onPress={onSave}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

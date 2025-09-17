import React, { useMemo } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import { AppText, Button } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./StickyEditor.styles";
import { Picker } from "@react-native-picker/picker";
import type { FoodComponent } from "@/types/models";

interface StickyEditorProps {
  tempName: string;
  tempAmount: number;
  tempUnit: FoodComponent["unit"];
  setTempName: (v: string) => void;
  setTempAmount: React.Dispatch<React.SetStateAction<number>>;
  setTempUnit: React.Dispatch<
    React.SetStateAction<FoodComponent["unit"]>
  >;
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
  tempUnit,
  setTempName,
  setTempAmount,
  setTempUnit,
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

  const unitOptions = useMemo<FoodComponent["unit"][]>(
    () => [
      "g",
      "oz",
      "ml",
      "fl oz",
      "cup",
      "tbsp",
      "tsp",
      "scoop",
      "piece",
      "serving",
    ],
    []
  );

  const amountOptions = useMemo(() => {
    // 0..1000 incremental options
    const arr: number[] = [];
    for (let i = 0; i <= 1000; i++) arr.push(i);
    return arr;
  }, []);

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
          Amount & Unit
        </AppText>
        <View
          style={[
            styles.focusWrapper,
            { borderColor: amountFocused ? colors.accent : "transparent" },
          ]}
        >
          <View style={styles.pickerRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={tempAmount}
                onValueChange={(v) => setTempAmount(Number(v))}
                itemStyle={styles.pickerItem as any}
              >
                {amountOptions.map((n) => (
                  <Picker.Item key={n} label={String(n)} value={n} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={tempUnit}
                onValueChange={(v) =>
                  setTempUnit(v as FoodComponent["unit"])
                }
                itemStyle={styles.pickerItem as any}
              >
                {unitOptions.map((u) => (
                  <Picker.Item key={u} label={u} value={u} />
                ))}
              </Picker>
            </View>
          </View>
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

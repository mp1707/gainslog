import React, { useMemo } from "react";
import { View, TextInput as RNTextInput, Platform } from "react-native";
import { AppText, Button } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentEditorSheet.styles";
import { Picker } from "@react-native-picker/picker";
import type { FoodComponent } from "@/types/models";

export interface ComponentEditorSheetProps {
  tempName: string;
  tempAmount: number;
  tempUnit: FoodComponent["unit"];
  setTempName: (v: string) => void;
  setTempAmount: React.Dispatch<React.SetStateAction<number>>;
  setTempUnit: React.Dispatch<React.SetStateAction<FoodComponent["unit"]>>;
  focusNameOnAdd: boolean;
  nameFocused: boolean;
  amountFocused: boolean;
  setNameFocused: (v: boolean) => void;
  setAmountFocused: (v: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
}

export const ComponentEditorSheet: React.FC<ComponentEditorSheetProps> = ({
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
    const arr: number[] = [];
    for (let i = 0; i <= 1000; i++) arr.push(i);
    return arr;
  }, []);

  return (
    <View style={styles.container}>
      <AppText role="Title2" style={styles.sheetTitle}>
        Edit Ingredient
      </AppText>

      <View style={styles.fieldGroup}>
        <AppText role="Caption" style={styles.label}>
          Name
        </AppText>
        <View
          style={[
            styles.inputWrapper,
            { borderColor: nameFocused ? colors.accent : colors.border },
          ]}
        >
          <RNTextInput
            placeholder="e.g. Chicken Breast"
            value={tempName}
            onChangeText={setTempName}
            placeholderTextColor={colors.secondaryText}
            autoFocus={focusNameOnAdd}
            keyboardAppearance={colorScheme}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={styles.textInput}
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText role="Caption" style={styles.label}>
          Amount & Unit
        </AppText>
        <View
          style={styles.pickerArea}
          onLayout={() => setAmountFocused(false)}
        >
          <View style={styles.pickerCol}>
            <Picker
              selectedValue={tempAmount}
              onValueChange={(v) => setTempAmount(Number(v))}
              itemStyle={{ color: colors.primaryText }}
            >
              {amountOptions.map((n) => (
                <Picker.Item key={n} label={String(n)} value={n} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerCol}>
            <Picker
              selectedValue={tempUnit}
              onValueChange={(v) => setTempUnit(v as FoodComponent["unit"])}
              itemStyle={{ color: colors.primaryText }}
            >
              {unitOptions.map((u) => (
                <Picker.Item key={u} label={u} value={u} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionFlex}>
          <Button variant="tertiary" label="Cancel" onPress={onCancel} />
        </View>
        <View style={styles.actionFlex}>
          <Button
            variant="primary"
            label="Save"
            disabled={saveDisabled}
            onPress={onSave}
          />
        </View>
      </View>
    </View>
  );
};

export default ComponentEditorSheet;

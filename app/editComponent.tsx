import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View, Alert } from "react-native";
import { Trash2, X, Check } from "lucide-react-native";
import { RoundButton } from "@/components/shared/RoundButton";
import type { FoodComponent, FoodUnit } from "@/types/models";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { AppText } from "@/components/index";
import { TextInput } from "@/components/shared/TextInput";
import { Toggle, ToggleOption } from "@/components/shared/Toggle";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function EditComponent() {
  const {
    mode = "create",
    index: indexParam,
    name: nameParam = "",
    amount: amountParam = "0",
    unit: unitParam = "g",
    logId,
  } = useLocalSearchParams<{
    mode?: "create" | "edit";
    index?: string;
    name?: string;
    amount?: string;
    unit?: string;
    logId: string;
  }>();

  const router = useSafeRouter();
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Get last used unit from store for create mode
  const lastUsedUnit = useAppStore((s) => s.lastUsedUnit || "g");

  // Local state for editing
  const [name, setName] = useState(nameParam || "");
  const [amount, setAmount] = useState(amountParam || "");
  const [unit, setUnit] = useState<FoodUnit>(
    mode === "create" ? lastUsedUnit : (unitParam as FoodUnit) || "g"
  );
  const [isDirty, setIsDirty] = useState(false);

  // Refs for focus management
  const nameInputRef = useRef<any>(null);
  const amountInputRef = useRef<any>(null);

  // Track if we've set initial focus
  const hasSetInitialFocus = useRef(false);

  // Unit options
  const unitOptions: ToggleOption<FoodUnit>[] = useMemo(
    () => [
      { value: "g", label: "grams" },
      { value: "ml", label: "milliliters" },
      { value: "piece", label: "pieces" },
    ],
    []
  );

  // Set initial focus after modal transition (300ms delay)
  useEffect(() => {
    if (!hasSetInitialFocus.current) {
      const timer = setTimeout(() => {
        if (mode === "create") {
          nameInputRef.current?.focus();
        } else {
          amountInputRef.current?.focus();
        }
        hasSetInitialFocus.current = true;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Detect changes for dirty flag
  useEffect(() => {
    if (mode === "edit") {
      const hasChanges =
        name !== nameParam ||
        amount !== amountParam ||
        unit !== (unitParam as FoodUnit);
      setIsDirty(hasChanges);
    } else {
      // In create mode, dirty if any field has content
      setIsDirty(name.trim().length > 0 || parseFloat(amount) > 0);
    }
  }, [name, amount, unit, nameParam, amountParam, unitParam, mode]);

  // Validation
  const nameError = useMemo(() => {
    const trimmed = name.trim();
    if (mode === "create" && trimmed.length === 0) {
      return "Enter a food name.";
    }
    if (trimmed.length > 0 && trimmed.length < 2) {
      return "Name must be at least 2 characters.";
    }
    if (trimmed.length > 60) {
      return "Name must be less than 60 characters.";
    }
    return null;
  }, [name, mode]);

  const amountError = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return "Enter a valid amount greater than 0.";
    }
    // Check for max 1 decimal place
    const decimalPart = amount.split(".")[1];
    if (decimalPart && decimalPart.length > 1) {
      return "Amount can have at most 1 decimal place.";
    }
    return null;
  }, [amount]);

  const isValid = !nameError && !amountError && name.trim().length > 0;

  // Handle unit change
  const handleUnitChange = useCallback((newUnit: FoodUnit) => {
    Haptics.selectionAsync();
    setUnit(newUnit);
  }, []);

  // Handle Save
  const handleSave = useCallback(() => {
    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(theme.interactions.haptics.light);

    const component: FoodComponent = {
      name: name.trim(),
      amount: parseFloat(amount),
      unit,
    };

    // Store last used unit for future creates
    if (mode === "create") {
      useAppStore.getState().setLastUsedUnit(unit);
    }

    // Pass data back via store, then dismiss modal
    if (logId) {
      useAppStore.getState().setPendingComponentEdit({
        logId,
        component,
        index: mode === "edit" && indexParam ? parseInt(indexParam, 10) : "new",
        action: "save",
      });
    }

    router.back();
  }, [isValid, name, amount, unit, mode, router, logId, indexParam, theme]);

  // Handle Cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, router]);

  // Handle Delete (edit mode only)
  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Ingredient",
      "Are you sure you want to delete this ingredient?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Pass delete signal back via store, then dismiss modal
            if (logId && indexParam) {
              useAppStore.getState().setPendingComponentEdit({
                logId,
                component: { name: "", amount: 0, unit: "g" }, // Dummy component for delete
                index: parseInt(indexParam, 10),
                action: "delete",
              });
            }
            router.back();
          },
        },
      ]
    );
  }, [router, logId, indexParam]);

  return (
    <View style={styles.container}>
      {/* Header with title and buttons */}
      <View style={styles.header}>
        <RoundButton
          Icon={mode === "edit" ? Trash2 : X}
          onPress={mode === "edit" ? handleDelete : handleCancel}
          variant={mode === "edit" ? "red" : "tertiary"}
          accessibilityLabel={mode === "edit" ? "Delete ingredient" : "Cancel"}
        />
        <AppText role="Title2" style={styles.modalTitle}>
          {mode === "create" ? "New Ingredient" : "Ingredient"}
        </AppText>
        <RoundButton
          Icon={Check}
          onPress={handleSave}
          variant={isValid ? "primary" : "tertiary"}
          disabled={!isValid}
          accessibilityLabel="Save"
        />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        bottomOffset={theme.spacing.lg}
      >

        {/* Name Field */}
        <View style={styles.fieldGroup}>
          <AppText role="Headline" style={styles.fieldLabel}>
            Name
          </AppText>
          <TextInput
            ref={nameInputRef}
            value={name}
            onChangeText={(text) => {
              setName(text);
            }}
            placeholder="Enter food name"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => amountInputRef.current?.focus()}
            fontSize="Body"
          />
        </View>

        {/* Quantity Field */}
        <View style={styles.fieldGroup}>
          <AppText role="Headline" style={styles.fieldLabel}>
            Quantity
          </AppText>
          <TextInput
            ref={amountInputRef}
            value={amount}
            onChangeText={(text) => {
              // Allow numbers and single decimal point
              const sanitized = text.replace(/[^0-9.]/g, "");
              // Prevent multiple decimals
              const parts = sanitized.split(".");
              if (parts.length > 2) {
                setAmount(parts[0] + "." + parts.slice(1).join(""));
              } else {
                setAmount(sanitized);
              }
            }}
            placeholder="0"
            placeholderTextColor={colors.secondaryText}
            style={styles.input}
            keyboardType="decimal-pad"
            fontSize="Body"
            accessibilityLabel={`Quantity, text field. In ${
              unit === "g" ? "grams" : unit === "ml" ? "milliliters" : "pieces"
            }`}
          />
        </View>

        {/* Unit Field */}
        <View style={styles.fieldGroup}>
          <AppText role="Headline" style={styles.fieldLabel}>
            Unit
          </AppText>
          <Toggle
            value={unit}
            options={unitOptions}
            onChange={handleUnitChange}
            accessibilityLabel="Select unit"
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg + theme.spacing.xl, // 24 + 32 = 56pt safe area spacer
      gap: theme.spacing.lg, // Tighter spacing: 24pt instead of 32pt
    },
    modalTitle: {
      flex: 1,
      textAlign: "center",
    },
    fieldGroup: {
      gap: theme.spacing.sm, // 8pt between label and input
    },
    fieldLabel: {
      color: colors.secondaryText,
      marginBottom: theme.spacing.xs, // 4pt below label
    },
    input: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius, // 18pt
      paddingHorizontal: theme.spacing.lg, // 24pt horizontal padding
      paddingVertical: theme.spacing.md + theme.spacing.xs, // ~20pt vertical (48-52pt total height)
      color: colors.primaryText,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 50, // Ensure 48-52pt height
    },
  });

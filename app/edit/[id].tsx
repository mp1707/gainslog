import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput as RNTextInput,
  Pressable,
} from "react-native";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { makeSelectLogById } from "@/store/selectors";
import { AppText, Button } from "@/components";
import { TextInput } from "@/components/shared/TextInput";
import type { FoodLog, FoodComponent } from "@/types/models";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Layout,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { useEstimation } from "@/hooks/useEstimation";
import { Swipeable } from "react-native-gesture-handler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const router = useRouter();

  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme);
  const { startReEstimation } = useEstimation();

  // Local state to hold edits (do not mutate store until confirmed)
  const [editedLog, setEditedLog] = useState<FoodLog | undefined>(originalLog);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefined, setIsRefined] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempAmount, setTempAmount] = useState("");
  // When adding a new ingredient, we auto-focus the Name field once
  const [focusNameOnAdd, setFocusNameOnAdd] = useState(false);
  // Local focus state for sticky editor inputs (for accent border)
  const [nameFocused, setNameFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const isEditing = expandedIndex !== null || addingNew;
  const [isDirty, setIsDirty] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const dimAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  useEffect(() => {
    if (isEditing) {
      overlayOpacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.ease),
      });
    } else {
      overlayOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Sync when originalLog loads or changes
  useEffect(() => {
    // Only sync from store when not locally editing/dirty
    if (!editedLog || !isDirty) {
      setEditedLog(originalLog);
    }
  }, [originalLog, isDirty]);

  // Confidence meter animation state
  const confidence = editedLog?.estimationConfidence ?? 0;
  const confidenceWidth = useSharedValue(confidence);
  useEffect(() => {
    confidenceWidth.value = withTiming(confidence, { duration: 350 });
  }, [confidence, confidenceWidth]);

  const handleDone = () => {
    if (id && editedLog) {
      const newTitle = (editedLog.title ?? '').trim();
      // Persist title change to the original log in the store
      updateFoodLog(id, { title: newTitle });
    }
    router.back();
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 90) return "High Accuracy";
    if (value >= 50) return "Medium Accuracy";
    if (value > 0) return "Low Accuracy";
    return "Uncertain";
  };

  const confidenceBarStyle = useAnimatedStyle(() => {
    const clamped = Math.max(0, Math.min(100, confidenceWidth.value));
    const bg = interpolateColor(
      clamped,
      [0, 50, 90, 100],
      [colors.error, colors.error, colors.warning, colors.success]
    );
    return {
      width: `${clamped}%`,
      backgroundColor: bg as string,
    };
  });

  // Track if components have changed relative to original
  const componentsHaveChanged = useMemo(() => {
    const orig = originalLog?.foodComponents ?? [];
    const curr = editedLog?.foodComponents ?? [];
    if (orig.length !== curr.length) return true;
    for (let i = 0; i < orig.length; i++) {
      const o = orig[i];
      const c = curr[i];
      if ((o?.name ?? "") !== (c?.name ?? "")) return true;
      if ((o?.amount ?? "") !== (c?.amount ?? "")) return true;
    }
    return false;
  }, [originalLog?.foodComponents, editedLog?.foodComponents]);

  // Handlers for components editing
  const handleUpdateComponent = (index: number, updated: FoodComponent) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = [...(prev.foodComponents || [])];
      comps[index] = updated;
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
  };

  const handleDeleteComponent = (index: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = (prev.foodComponents || []).filter((_, i) => i !== index);
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
  };

  const handleAddComponent = () => {
    // Do not insert an empty row. Open editor first and add on Save.
    setAddingNew(true);
    setExpandedIndex(null);
    setTempName("");
    setTempAmount("");
    setFocusNameOnAdd(true);
  };

  const handleReestimate = async () => {
    if (!editedLog) return;
    setIsLoading(true);
    try {
      await startReEstimation(editedLog, (log) => {
        setEditedLog(log);
        setIsDirty(false);
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRefined(true);
    } catch (e) {
      // You may add error toast here if desired
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButton}>
        <RoundButton
          Icon={Check}
          onPress={handleDone}
          variant={"primary"}
          accessibilityLabel="Close"
        />
      </View>
      <KeyboardAwareScrollView
        style={[styles.scrollView]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        bottomOffset={200}
      >
        {!editedLog ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {/* Confidence Meter */}
            <View style={styles.card}>
              <View style={styles.confidenceHeader}>
                <AppText role="Headline">Estimation Accuracy</AppText>
                <AppText role="Subhead" color="secondary">
                  {editedLog.estimationConfidence ?? 0}% •{" "}
                  {getConfidenceLabel(editedLog.estimationConfidence ?? 0)}
                </AppText>
              </View>
              <View
                style={[
                  styles.meterTrack,
                  { backgroundColor: colors.disabledBackground },
                ]}
              >
                <Animated.View style={[styles.meterFill, confidenceBarStyle]} />
              </View>
            </View>

            {/* Title input */}
            <View style={styles.card}>
              <AppText role="Caption" style={styles.sectionHeader}>
                MEAL TITLE
              </AppText>
              <TextInput
                placeholder="Title"
                value={editedLog.title || ""}
                onChangeText={(text) => {
                  return setEditedLog((prev) => {
                    if (!prev) return prev;
                    const next = { ...prev, title: text };
                    setIsDirty(true);
                    return next;
                  });
                }}
                fontSize="Headline"
                style={[styles.titleInputContainer, styles.titleInput]}
              />
            </View>

            {/* Macros display */}
            <View style={styles.card}>
              <AppText role="Caption" style={styles.sectionHeader}>
                MACROS
              </AppText>
              <View style={styles.macroRow}>
                <AppText>Calories</AppText>
                <AppText color="secondary">
                  {editedLog.calories ?? 0} kcal
                </AppText>
              </View>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <View style={styles.macroRow}>
                <AppText>Protein</AppText>
                <AppText color="secondary">{editedLog.protein ?? 0} g</AppText>
              </View>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <View style={styles.macroRow}>
                <AppText>Carbs</AppText>
                <AppText color="secondary">{editedLog.carbs ?? 0} g</AppText>
              </View>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <View style={styles.macroRow}>
                <AppText>Fat</AppText>
                <AppText color="secondary">{editedLog.fat ?? 0} g</AppText>
              </View>
            </View>

            {/* Editable component list */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <AppText role="Caption" style={styles.sectionHeader}>
                  COMPONENTS
                </AppText>
              </View>
              {(editedLog.foodComponents || []).map((comp, index) => {
                return (
                  <Animated.View
                    key={`${comp.name}-${index}`}
                    layout={Layout.duration(220).easing(
                      Easing.inOut(Easing.ease)
                    )}
                    style={{ overflow: "hidden" }}
                  >
                    <Swipeable
                      renderRightActions={() => (
                        <TouchableOpacity
                          onPress={() => handleDeleteComponent(index)}
                          style={styles.deleteAction}
                          accessibilityLabel="Delete ingredient"
                        >
                          <Trash2 size={18} color={colors.white} />
                          <AppText role="Button" color="white">
                            Delete
                          </AppText>
                        </TouchableOpacity>
                      )}
                    >
                      <TouchableOpacity
                        style={styles.componentRow}
                        onPress={() => {
                          // Open sticky editor when tapping the row.
                          setExpandedIndex(index);
                          setAddingNew(false);
                          setTempName(comp.name);
                          setTempAmount(comp.amount);
                          setFocusNameOnAdd(false);
                        }}
                      >
                        <AppText style={{ flex: 1 }}>{comp.name}</AppText>
                        <AppText color="secondary" style={{ marginRight: 8 }}>
                          {comp.amount}
                        </AppText>
                        <ChevronRight size={18} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </Swipeable>

                    {/* Inline editor removed; editing handled by sticky view */}
                  </Animated.View>
                );
              })}
              <TouchableOpacity
                onPress={handleAddComponent}
                style={styles.addRow}
                disabled={isLoading || originalLog?.isEstimating}
                accessibilityLabel="Add Ingredient"
              >
                <Plus size={18} color={colors.accent} />
                <AppText style={{ marginLeft: 8 }} color="accent">
                  Add Ingredient
                </AppText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
      {isEditing && (
        <AnimatedPressable
          onPress={() => {
            // Tap outside to dismiss the sticky editor
            setExpandedIndex(null);
            setAddingNew(false);
            setFocusNameOnAdd(false);
          }}
          style={[styles.dimOverlay, dimAnimatedStyle]}
          accessibilityLabel="Dismiss editor overlay"
          accessibilityRole="button"
        >
          <BlurView
            intensity={28}
            tint={colorScheme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dimColor} />
        </AnimatedPressable>
      )}
      {!isEditing && editedLog && (
        <View style={styles.floatingActionContainer}>
          <View style={styles.floatingAccessory}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Button
                variant="primary"
                label="Estimate again"
                Icon={Sparkles}
                onPress={handleReestimate}
                disabled={
                  isLoading ||
                  originalLog?.isEstimating ||
                  !componentsHaveChanged
                }
              />
            </View>
          </View>
        </View>
      )}
      {isEditing && (
        <KeyboardStickyView offset={{ closed: -30, opened: 0 }}>
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
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  style={{
                    minHeight: 44,
                    padding: theme.spacing.md,
                    color: colors.primaryText,
                    backgroundColor: colors.primaryBackground,
                    borderRadius: theme.components.cards.cornerRadius,
                    fontFamily: theme.typography.Headline.fontFamily,
                    fontSize: theme.typography.Headline.fontSize,
                  }}
                />
              </View>
              <AppText role="Caption" style={styles.inlineLabel}>
                Amount
              </AppText>
              <View
                style={[
                  styles.focusWrapper,
                  {
                    borderColor: amountFocused ? colors.accent : "transparent",
                  },
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
                  style={{
                    minHeight: 44,
                    padding: theme.spacing.md,
                    color: colors.primaryText,
                    backgroundColor: colors.primaryBackground,
                    borderRadius: theme.components.cards.cornerRadius,
                    fontFamily: theme.typography.Headline.fontFamily,
                    fontSize: theme.typography.Headline.fontSize,
                  }}
                />
              </View>
              <View style={styles.inlineActions}>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="tertiary"
                    label="Cancel"
                    onPress={() => {
                      // If we were adding a new ingredient, simply close without inserting
                      setExpandedIndex(null);
                      setAddingNew(false);
                      setFocusNameOnAdd(false);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="primary"
                    label="Save"
                    disabled={
                      tempName.trim().length === 0 ||
                      tempAmount.trim().length === 0
                    }
                    onPress={() => {
                      const newComp = {
                        name: tempName.trim(),
                        amount: tempAmount.trim(),
                      } as FoodComponent;
                      if (addingNew) {
                        setEditedLog((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            foodComponents: [
                              ...(prev.foodComponents || []),
                              newComp,
                            ],
                          };
                        });
                        setIsDirty(true);
                      } else if (expandedIndex !== null) {
                        handleUpdateComponent(expandedIndex, newComp);
                      }
                      setExpandedIndex(null);
                      setAddingNew(false);
                      setFocusNameOnAdd(false);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardStickyView>
      )}
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, paddingTop: theme.spacing.xxl + theme.spacing.md },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    floatingActionContainer: {
      position: "absolute",
      left: "5%",
      right: "5%",
      bottom: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
    },
    floatingAccessory: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 9999,
      padding: theme.spacing.sm,
      overflow: "hidden",
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
      color: colors.secondaryText,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl,
    },
    card: {
      padding: theme.spacing.md,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: colors.secondaryBackground,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    confidenceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
    },
    meterTrack: {
      width: "100%",
      height: 12,
      borderRadius: 6,
      overflow: "hidden",
    },
    meterFill: {
      height: "100%",
      borderRadius: 6,
    },
    titleInputContainer: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
    },
    titleInput: {
      minHeight: 44,
    },
    macroRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
    },
    divider: {
      height: 1,
      marginHorizontal: -theme.spacing.md,
    },
    componentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    deleteAction: {
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.components.cards.cornerRadius,
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    stickyContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      backgroundColor: "transparent",
    },
    stickyPill: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      borderRadius: 9999,
      padding: theme.spacing.sm,
      overflow: "hidden",
    },
    stickyEditorPill: {
      marginHorizontal: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.md,
    },
    spinnerOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    dimOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    inlineEditor: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    inlineLabel: {
      marginBottom: theme.spacing.xs,
      color: colors.secondaryText,
    },
    inlineInput: {
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      marginBottom: theme.spacing.sm,
    },
    inlineActions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    focusWrapper: {
      borderWidth: 2,
      borderRadius: theme.components.cards.cornerRadius,
      backgroundColor: "transparent",
      marginBottom: theme.spacing.sm,
    },
    dimColor: {
      backgroundColor: "#000",
    },
  });

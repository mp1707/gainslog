import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView as RNScrollView,
} from "react-native";
import { Check } from "lucide-react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { makeSelectLogById } from "@/store/selectors";
import type { FoodLog, FoodComponent } from "@/types/models";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEstimation } from "@/hooks/useEstimation";
import { lockNav } from "@/utils/navigationLock";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ConfidenceCard } from "@/components/refine-page/ConfidenceCard/ConfidenceCard";
import { TitleCard } from "@/components/refine-page/TitleCard/TitleCard";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { StickyEditor } from "@/components/refine-page/StickyEditor/StickyEditor";
import { FloatingAction } from "@/components/refine-page/FloatingAction/FloatingAction";
import { DimOverlay } from "@/components/refine-page/DimOverlay/DimOverlay";
import { DescriptionCard } from "@/components/refine-page/DescriptionCard/DescriptionCard";
import { ImageDisplay } from "@/components/shared/ImageDisplay";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const router = useRouter();

  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { startReEstimation } = useEstimation();
  const scrollRef = useRef<RNScrollView | null>(null);
  const navigation = useNavigation();

  // Local state to hold edits (do not mutate store until confirmed)
  const [editedLog, setEditedLog] = useState<FoodLog | undefined>(originalLog);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefined, setIsRefined] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
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

  // Note: per-id modal, cleanup happens on unmount

  // Also lock navigation when this modal unmounts (e.g., swipe-to-dismiss)
  useEffect(() => {
    return () => {
      // Small lock to avoid immediately opening another modal during dismissal
      lockNav(800);
    };
  }, []);

  // Lock around gesture-driven dismiss transitions
  useEffect(() => {
    const subs: Array<() => void> = [];
    // @ts-expect-error event names exist in React Navigation stack
    const sub1 = navigation.addListener?.("gestureStart", () => {
      lockNav(800);
    });
    // @ts-expect-error event payload includes closing flag
    const sub2 = navigation.addListener?.("transitionStart", (e: any) => {
      if (e?.data?.closing) lockNav(800);
    });
    if (typeof sub1 === "function") subs.push(sub1);
    if (typeof sub2 === "function") subs.push(sub2);
    return () => subs.forEach((off) => off());
  }, [navigation]);

  // On blur (when this modal loses focus), set a brief lock
  useFocusEffect(
    useMemo(
      () => () => {
        lockNav(800);
      },
      []
    )
  );

  // Sync when originalLog loads or changes
  useEffect(() => {
    // Only sync from store when not locally editing/dirty
    if (!editedLog || !isDirty) {
      setEditedLog(originalLog);
    }
  }, [originalLog, isDirty]);

  // Confidence UI is handled inside ConfidenceCard component

  const handleDone = () => {
    if (id && editedLog) {
      const newTitle = (editedLog.title ?? "").trim();
      // Persist title change to the original log in the store
      updateFoodLog(id, { title: newTitle });
    }
    router.back();
  };

  // Animated dimmer for editor overlay (defined above as dimAnimatedStyle)

  // Track if components have changed relative to original
  const componentsHaveChanged = useMemo(() => {
    const orig = originalLog?.foodComponents ?? [];
    const curr = editedLog?.foodComponents ?? [];

    // Also consider description changes
    if ((originalLog?.description ?? "") !== (editedLog?.description ?? "")) {
      return true;
    }

    if (orig.length !== curr.length) return true;
    for (let i = 0; i < orig.length; i++) {
      const o = orig[i];
      const c = curr[i];
      if ((o?.name ?? "") !== (c?.name ?? "")) return true;
      if ((o?.amount ?? "") !== (c?.amount ?? "")) return true;
    }
    return false;
  }, [
    originalLog?.foodComponents,
    editedLog?.foodComponents,
    originalLog?.description,
    editedLog?.description,
  ]);

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
    // Scroll to top when re-estimating to show accuracy and updates
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setIsRefined(false);
    setIsLoading(true);
    try {
      await startReEstimation(editedLog, (log) => {
        setEditedLog(log);
        setIsDirty(false);
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRefined(true);
      setRevealKey((k) => k + 1);
      // Reset refined flag after brief celebration window
      setTimeout(() => setIsRefined(false), 1200);
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
        ref={scrollRef as any}
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
            <ConfidenceCard
              value={editedLog.estimationConfidence ?? 0}
              processing={isLoading || !!originalLog?.isEstimating}
              reveal={isRefined}
            />

            {/* Title input */}
            <TitleCard
              value={editedLog.title || ""}
              onChange={(text) =>
                setEditedLog((prev) => {
                  if (!prev) return prev;
                  const next = { ...prev, title: text };
                  setIsDirty(true);
                  return next;
                })
              }
            />

            {/* Image display (like on create) */}
            <ImageDisplay
              imageUrl={editedLog.localImagePath}
              isUploading={false}
            />

            {/* Macros display */}
            <MacrosCard
              calories={editedLog.calories}
              protein={editedLog.protein}
              carbs={editedLog.carbs}
              fat={editedLog.fat}
              processing={isLoading || !!originalLog?.isEstimating}
              revealKey={revealKey}
            />

            {/* Description input */}
            {editedLog.description && (
              <DescriptionCard
                value={editedLog.description || ""}
                onChange={(text) =>
                  setEditedLog((prev) => {
                    if (!prev) return prev;
                    const next = { ...prev, description: text };
                    setIsDirty(true);
                    return next;
                  })
                }
              />
            )}

            {/* Editable component list */}
            <ComponentsList
              components={editedLog.foodComponents || []}
              onPressItem={(index, comp) => {
                setExpandedIndex(index);
                setAddingNew(false);
                setTempName(comp.name);
                setTempAmount(comp.amount);
                setFocusNameOnAdd(false);
              }}
              onDeleteItem={handleDeleteComponent}
              onAddPress={handleAddComponent}
              disabled={isLoading || originalLog?.isEstimating}
            />
          </>
        )}
      </KeyboardAwareScrollView>
      {isEditing && (
        <DimOverlay
          onPress={() => {
            setExpandedIndex(null);
            setAddingNew(false);
            setFocusNameOnAdd(false);
          }}
          style={dimAnimatedStyle as any}
        />
      )}
      {!isEditing && editedLog && (
        <FloatingAction
          onPress={handleReestimate}
          disabled={
            isLoading || originalLog?.isEstimating || !componentsHaveChanged
          }
          isProcessing={isLoading || !!originalLog?.isEstimating}
          didSucceed={isRefined}
        />
      )}
      {isEditing && (
        <KeyboardStickyView offset={{ closed: -30, opened: 0 }}>
          <StickyEditor
            tempName={tempName}
            tempAmount={tempAmount}
            setTempName={setTempName}
            setTempAmount={setTempAmount}
            focusNameOnAdd={focusNameOnAdd}
            nameFocused={nameFocused}
            amountFocused={amountFocused}
            setNameFocused={setNameFocused}
            setAmountFocused={setAmountFocused}
            onCancel={() => {
              setExpandedIndex(null);
              setAddingNew(false);
              setFocusNameOnAdd(false);
            }}
            onSave={() => {
              const newComp = {
                name: tempName.trim(),
                amount: tempAmount.trim(),
              } as FoodComponent;
              if (addingNew) {
                setEditedLog((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    foodComponents: [...(prev.foodComponents || []), newComp],
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
            saveDisabled={
              tempName.trim().length === 0 || tempAmount.trim().length === 0
            }
          />
        </KeyboardStickyView>
      )}
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, paddingTop: theme.spacing.xxl + theme.spacing.lg },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xxl * 2,
      gap: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl,
    },
  });

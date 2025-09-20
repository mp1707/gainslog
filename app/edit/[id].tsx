import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme, useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView as RNScrollView,
  Pressable,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { makeSelectLogById } from "@/store/selectors";
import type { FoodLog, FoodComponent } from "@/types/models";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEstimation } from "@/hooks/useEstimation";
import { useNavigation } from "@react-navigation/native";
import { ConfidenceCard } from "@/components/refine-page/ConfidenceCard/ConfidenceCard";
import { TitleCard } from "@/components/refine-page/TitleCard/TitleCard";
import { MacrosCard } from "@/components/refine-page/MacrosCard/MacrosCard";
import { ComponentsList } from "@/components/refine-page/ComponentsList/ComponentsList";
import { ComponentEditorSheet } from "@/components/refine-page/ComponentEditorSheet/ComponentEditorSheet";
import { FloatingAction } from "@/components/refine-page/FloatingAction/FloatingAction";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { AppText } from "@/components/index";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "@/components/shared/TextInput";
import { getRefinementInfoDetailed } from "@/utils/getRefinementInfo";

const deriveConfidenceLevel = (confidence?: number): 0 | 1 | 2 | 3 => {
  if (!confidence) return 0;

  const normalized = Math.min(100, Math.max(0, Math.floor(confidence)));

  if (normalized >= 76) return 3;
  if (normalized >= 50) return 2;
  if (normalized >= 30) return 1;
  return 0;
};

export default function Edit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalLog = useAppStore(makeSelectLogById(id));
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const router = useRouter();

  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const { runEditEstimation } = useEstimation();
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
  const [tempAmount, setTempAmount] = useState<number>(0);
  const [tempUnit, setTempUnit] = useState<FoodComponent["unit"]>("g");
  // When adding a new ingredient, we auto-focus the Name field once
  const [focusNameOnAdd, setFocusNameOnAdd] = useState(false);
  // Local focus state for sticky editor inputs (for accent border)
  const [nameFocused, setNameFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const isEditing = expandedIndex !== null || addingNew;
  const [isDirty, setIsDirty] = useState(false);
  // Snapshot of components at last successful estimation
  const [lastEstimatedComponents, setLastEstimatedComponents] = useState<
    FoodComponent[] | undefined
  >();
  const [hasReestimated, setHasReestimated] = useState(false);
  // Title editing state
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(editedLog?.title || "");
  const sheetRef = useRef<BottomSheet | null>(null);
  const openGuardAtRef = useRef<number>(0);
  useEffect(() => {
    if (isEditing) {
      // Imperatively open without controlling the index prop
      sheetRef.current?.expand?.();
    } else {
      sheetRef.current?.close?.();
    }
  }, [isEditing]);

  // Note: per-id modal, cleanup happens on unmount

  // Sync when originalLog loads or changes
  useEffect(() => {
    // Only sync from store when not locally editing/dirty
    if (!editedLog || !isDirty) {
      setEditedLog(originalLog);
    }
  }, [originalLog, isDirty]);

  // Sync tempTitle with editedLog title
  useEffect(() => {
    if (editedLog && !isTitleEditing) {
      setTempTitle(editedLog.title || "");
    }
  }, [editedLog?.title, isTitleEditing]);

  // Check if title has changed
  const titleChanged = tempTitle.trim() !== (originalLog?.title || "").trim();

  // Confidence UI is handled inside ConfidenceCard component

  const handleDone = () => {
    if (id && editedLog) {
      // Persist all updated values to the store
      updateFoodLog(id, {
        title: tempTitle.trim(),
        calories: editedLog.calories,
        protein: editedLog.protein,
        carbs: editedLog.carbs,
        fat: editedLog.fat,
        estimationConfidence: editedLog.estimationConfidence,
        foodComponents: editedLog.foodComponents || [],
      });
    }
    router.back();
  };

  // Animated dimmer for editor overlay (defined above as dimAnimatedStyle)

  // Initialize baseline components once on first load to require a change before estimating
  useEffect(() => {
    if (editedLog && lastEstimatedComponents === undefined) {
      setLastEstimatedComponents([...(editedLog.foodComponents || [])]);
    }
  }, [editedLog, lastEstimatedComponents]);

  // Track if components have changed relative to last successful estimation
  const componentsChangedSinceLastEstimate = useMemo(() => {
    const baseline = lastEstimatedComponents ?? [];
    const curr = editedLog?.foodComponents ?? [];

    if (baseline.length !== curr.length) return true;
    for (let i = 0; i < baseline.length; i++) {
      const o = baseline[i];
      const c = curr[i];
      if ((o?.name ?? "") !== (c?.name ?? "")) return true;
      if ((o?.amount ?? 0) !== (c?.amount ?? 0)) return true;
      if ((o?.unit ?? "") !== (c?.unit ?? "")) return true;
      if ((o?.needsRefinement ?? false) !== (c?.needsRefinement ?? false))
        return true;
    }
    return false;
  }, [lastEstimatedComponents, editedLog?.foodComponents]);

  const estimationConfidence = editedLog?.estimationConfidence ?? 0;
  const confidenceLevel = useMemo(
    () => deriveConfidenceLevel(estimationConfidence),
    [estimationConfidence]
  );
  const confidenceInfoSubText = useMemo(
    () => getRefinementInfoDetailed(editedLog?.foodComponents ?? []),
    [editedLog?.foodComponents]
  );
  const isConfidenceLoading = isLoading || !!originalLog?.isEstimating;

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

  const handleMarkComponentOk = (index: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const comps = [...(prev.foodComponents || [])];
      const existing = comps[index];
      if (existing) {
        comps[index] = { ...existing, needsRefinement: false };
      }
      return { ...prev, foodComponents: comps };
    });
    setIsDirty(true);
  };

  const handleAddComponent = () => {
    // Do not insert an empty row. Open editor first and add on Save.
    openGuardAtRef.current = Date.now();
    setTimeout(() => {
      setAddingNew(true);
      setExpandedIndex(null);
      setTempName("");
      setTempAmount(0);
      setTempUnit("g");
      setFocusNameOnAdd(true);
    }, 30);
  };

  const handleReestimate = async () => {
    if (!editedLog) return;
    // Scroll to bottom when re-estimating to show macros section
    scrollRef.current?.scrollToEnd({ animated: true });
    setIsRefined(false);
    setIsLoading(true);
    try {
      await runEditEstimation(editedLog, (log) => {
        setEditedLog(log);
        // Baseline set to the components as of the successful estimation result
        setLastEstimatedComponents([...(log.foodComponents || [])]);
      });
      setIsDirty(true); // local changes pending save
      setHasReestimated(true); // enable Done button

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRefined(true);
      setRevealKey((k) => k + 1);
      // Reset refined flag after brief celebration window
      setTimeout(() => setIsRefined(false), 1200);
    } catch (e) {
      // Optional: show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Title editing handlers
  const handleTitlePress = () => {
    setIsTitleEditing(true);
  };

  const handleTitleBlur = () => {
    setIsTitleEditing(false);
    if (editedLog) {
      setEditedLog({ ...editedLog, title: tempTitle.trim() });
      setIsDirty(true);
    }
  };

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButtonLeft}>
        <RoundButton
          Icon={X}
          onPress={() => router.back()}
          variant={"tertiary"}
          accessibilityLabel="Close"
        />
      </View>
      <View style={styles.closeButton}>
        <RoundButton
          Icon={Check}
          onPress={handleDone}
          variant={"primary"}
          disabled={!hasReestimated && !isDirty && !titleChanged}
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
        {isTitleEditing ? (
          <TextInput
            value={tempTitle}
            onChangeText={setTempTitle}
            onBlur={handleTitleBlur}
            autoFocus={true}
            // blurOnSubmit={true}
            style={[styles.header, styles.titleInput]}
            placeholder="Enter title..."
            placeholderTextColor={colors.secondaryText}
          />
        ) : (
          <Pressable onPress={handleTitlePress}>
            <AppText role="Title2" style={styles.header}>
              {tempTitle || "Tap to add title"}
            </AppText>
          </Pressable>
        )}
        {!editedLog ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {/* Editable component list */}
            <ComponentsList
              components={editedLog.foodComponents || []}
              onPressItem={(index, comp) => {
                openGuardAtRef.current = Date.now();
                setTimeout(() => {
                  setExpandedIndex(index);
                  setAddingNew(false);
                  setTempName(comp.name);
                  setTempAmount(comp.amount ?? 0);
                  setTempUnit(comp.unit ?? "g");
                  setFocusNameOnAdd(false);
                }, 30);
              }}
              onDeleteItem={handleDeleteComponent}
              onAddPress={handleAddComponent}
              onMarkOk={handleMarkComponentOk}
              disabled={isLoading || originalLog?.isEstimating}
            />
            <ConfidenceCard
              confidenceLevel={confidenceLevel}
              infoSubText={confidenceInfoSubText}
              isLoading={isConfidenceLoading}
            />
            {/* Macros display */}
            <MacrosCard
              calories={editedLog.calories}
              protein={editedLog.protein}
              carbs={editedLog.carbs}
              fat={editedLog.fat}
              processing={isConfidenceLoading}
              revealKey={revealKey}
            />

            {/* Image display (like on create) */}
            <ImageDisplay
              imageUrl={editedLog.localImagePath}
              isUploading={false}
            />
          </>
        )}
      </KeyboardAwareScrollView>
      {/* Bottom Sheet Editor replacing KeyboardStickyView */}
      <BottomSheet
        ref={sheetRef as any}
        snapPoints={["70%"]}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{
          backgroundColor: colors.secondaryBackground,
          borderRadius: "10%",
        }}
        onClose={() => {
          const sinceOpen = Date.now() - openGuardAtRef.current;
          if (sinceOpen < 250) {
            sheetRef.current?.expand?.();
            return;
          }
          setExpandedIndex(null);
          setAddingNew(false);
          setFocusNameOnAdd(false);
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.secondaryText,
          width: 40,
          height: 4,
          borderRadius: 2,
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.35}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            // Avoid closing immediately from the same tap that opens the sheet
            pressBehavior="none"
          />
        )}
      >
        {isEditing && (
          <BottomSheetView style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              bottomOffset={24}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.lg,
                paddingBottom: theme.spacing.xl,
                gap: theme.spacing.md,
              }}
            >
              <ComponentEditorSheet
                tempName={tempName}
                tempAmount={tempAmount}
                tempUnit={tempUnit}
                setTempName={setTempName}
                setTempAmount={setTempAmount}
                setTempUnit={setTempUnit}
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
                  const newComp: FoodComponent = {
                    name: tempName.trim(),
                    amount: Number(tempAmount) || 0,
                    unit: tempUnit,
                    needsRefinement: false,
                  };
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
                saveDisabled={tempName.trim().length === 0 || tempAmount <= 0}
              />
            </KeyboardAwareScrollView>
          </BottomSheetView>
        )}
      </BottomSheet>
      {!isEditing && editedLog && (
        <FloatingAction
          onPress={handleReestimate}
          disabled={
            isLoading ||
            originalLog?.isEstimating ||
            lastEstimatedComponents === undefined ||
            !componentsChangedSinceLastEstimate ||
            (editedLog.foodComponents?.length || 0) === 0
          }
          isProcessing={isLoading || !!originalLog?.isEstimating}
          didSucceed={isRefined}
        />
      )}
    </GradientWrapper>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    closeButtonLeft: {
      position: "absolute",
      top: theme.spacing.md,
      left: theme.spacing.md,
      zIndex: 15,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xxl + theme.spacing.xl,
      paddingBottom: theme.spacing.xxl * 2,
      gap: theme.spacing.md,
    },
    header: {
      paddingLeft: theme.spacing.sm,
    },
    titleInput: {
      color: colors.primaryText,
      fontSize: theme.typography.Title2.fontSize,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xl,
    },
  });

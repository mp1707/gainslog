import { useCallback, useEffect, useState } from "react";
import type { FoodComponent, FoodLog } from "@/types/models";
import type { AppState } from "@/store/useAppStore";

export const useEditedLog = ({
  logId,
  originalLog,
  pendingComponentEdit,
  clearPendingComponentEdit,
  onComponentChange,
}: {
  logId?: string;
  originalLog?: FoodLog;
  pendingComponentEdit?: AppState["pendingComponentEdit"];
  clearPendingComponentEdit: () => void;
  onComponentChange: () => void;
}) => {
  const [editedLog, setEditedLogState] = useState<FoodLog | undefined>(
    originalLog
  );
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (!originalLog) {
      setEditedLogState(undefined);
      return;
    }

    if (!isDirty) {
      if (originalLog.needsUserReview) {
        setEditedLogState({ ...originalLog, needsUserReview: false });
        setIsDirty(true);
      } else {
        setEditedLogState(originalLog);
      }
    }
  }, [originalLog, isDirty]);

  const replaceEditedLog = useCallback(
    (next: FoodLog, options: { markDirty?: boolean } = {}) => {
      setEditedLogState(next);
      if (options.markDirty !== false) {
        markDirty();
      }
    },
    [markDirty]
  );

  const updateTitle = useCallback(
    (title: string) => {
      setEditedLogState((prev) => (prev ? { ...prev, title } : prev));
      markDirty();
    },
    [markDirty]
  );

  const updateComponents = useCallback(
    (updater: (components: FoodComponent[]) => FoodComponent[]) => {
      setEditedLogState((prev) => {
        if (!prev) return prev;
        const currentComponents = prev.foodComponents || [];
        const nextComponents = updater(currentComponents);
        if (nextComponents === currentComponents) {
          return prev;
        }
        markDirty();
        onComponentChange();
        return { ...prev, foodComponents: nextComponents };
      });
    },
    [markDirty, onComponentChange]
  );

  const deleteComponent = useCallback(
    (index: number) => {
      updateComponents((components) => {
        if (!components[index]) {
          return components;
        }
        return components.filter((_, i) => i !== index);
      });
    },
    [updateComponents]
  );

  const acceptRecommendation = useCallback(
    (index: number) => {
      updateComponents((components) => {
        const component = components[index];
        if (!component?.recommendedMeasurement) {
          return components;
        }
        const { amount, unit } = component.recommendedMeasurement;
        const next = [...components];
        next[index] = {
          ...component,
          amount,
          unit: unit as FoodComponent["unit"],
          recommendedMeasurement: undefined,
        };
        return next;
      });
    },
    [updateComponents]
  );

  useEffect(() => {
    if (!pendingComponentEdit || pendingComponentEdit.logId !== logId) return;

    if (pendingComponentEdit.action === "save") {
      updateComponents((components) => {
        const next = [...components];
        if (pendingComponentEdit.index === "new") {
          next.push(pendingComponentEdit.component);
        } else {
          next[pendingComponentEdit.index] = pendingComponentEdit.component;
        }
        return next;
      });
    } else if (
      pendingComponentEdit.action === "delete" &&
      typeof pendingComponentEdit.index === "number"
    ) {
      deleteComponent(pendingComponentEdit.index);
    }

    clearPendingComponentEdit();
  }, [
    pendingComponentEdit,
    logId,
    updateComponents,
    deleteComponent,
    clearPendingComponentEdit,
  ]);

  return {
    editedLog,
    isDirty,
    markDirty,
    replaceEditedLog,
    updateTitle,
    deleteComponent,
    acceptRecommendation,
  } as const;
};

import { useCallback, useEffect, useState } from "react";
import type { Favorite, FoodComponent } from "@/types/models";
import type { AppState } from "@/store/useAppStore";

export const useEditedFavorite = ({
  favoriteId,
  originalFavorite,
  pendingComponentEdit,
  clearPendingComponentEdit,
  onComponentChange,
}: {
  favoriteId?: string;
  originalFavorite?: Favorite;
  pendingComponentEdit?: AppState["pendingComponentEdit"];
  clearPendingComponentEdit: () => void;
  onComponentChange: () => void;
}) => {
  const [editedFavorite, setEditedFavorite] = useState<Favorite | undefined>(
    originalFavorite
  );
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  useEffect(() => {
    if (!originalFavorite) {
      setEditedFavorite(undefined);
      return;
    }

    if (!isDirty) {
      setEditedFavorite(originalFavorite);
    }
  }, [originalFavorite, isDirty]);

  const replaceEditedFavorite = useCallback(
    (next: Favorite, options: { markDirty?: boolean } = {}) => {
      setEditedFavorite(next);
      if (options.markDirty !== false) {
        markDirty();
      }
    },
    [markDirty]
  );

  const updateTitle = useCallback(
    (title: string) => {
      setEditedFavorite((prev) => (prev ? { ...prev, title } : prev));
      markDirty();
    },
    [markDirty]
  );

  const updateComponents = useCallback(
    (updater: (components: FoodComponent[]) => FoodComponent[]) => {
      setEditedFavorite((prev) => {
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
    if (!pendingComponentEdit || pendingComponentEdit.logId !== favoriteId) {
      return;
    }

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
    favoriteId,
    updateComponents,
    deleteComponent,
    clearPendingComponentEdit,
  ]);

  return {
    editedFavorite,
    isDirty,
    markDirty,
    replaceEditedFavorite,
    updateTitle,
    deleteComponent,
    acceptRecommendation,
  } as const;
};

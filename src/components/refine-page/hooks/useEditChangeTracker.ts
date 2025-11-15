import { useCallback, useState } from "react";

export const useEditChangeTracker = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changesCount, setChangesCount] = useState(0);
  const [hasReestimated, setHasReestimated] = useState(false);

  const markComponentChange = useCallback(() => {
    setHasUnsavedChanges(true);
    setHasReestimated(false);
    setChangesCount((prev) => prev + 1);
  }, []);

  const markReestimated = useCallback(() => {
    setHasUnsavedChanges(false);
    setChangesCount(0);
    setHasReestimated(true);
  }, []);

  return {
    hasUnsavedChanges,
    changesCount,
    hasReestimated,
    markComponentChange,
    markReestimated,
  };
};

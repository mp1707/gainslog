import { useCallback, useEffect, useState } from "react";

export const useEditableTitle = ({
  title,
  onCommit,
}: {
  title: string;
  onCommit: (nextTitle: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(title);
    }
  }, [title, isEditing]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleChange = useCallback((value: string) => {
    setDraftTitle(value);
  }, []);

  const commit = useCallback(() => {
    const finalTitle = draftTitle.trim();
    setIsEditing(false);
    setDraftTitle(finalTitle);
    onCommit(finalTitle);
  }, [draftTitle, onCommit]);

  const handleBlur = useCallback(() => {
    if (!isEditing) return;
    commit();
  }, [commit, isEditing]);

  return {
    isEditing,
    draftTitle,
    startEditing,
    handleChange,
    handleBlur,
    commit,
  };
};

import { useEffect, useRef } from "react";
import type { FoodLog } from "@/types/models";

interface UseTranscriptionSyncParams {
  draft: FoodLog | undefined;
  isRecording: boolean;
  liveTranscription: string;
  updateDraft: (id: string, updates: Partial<FoodLog>) => void;
}

export const useTranscriptionSync = ({
  draft,
  isRecording,
  liveTranscription,
  updateDraft,
}: UseTranscriptionSyncParams) => {
  const baseDescriptionRef = useRef<string | null>(null);
  const lastAppliedTranscriptionRef = useRef<string | null>(null);
  const wasRecordingRef = useRef(false);

  useEffect(() => {
    if (!draft) return;

    if (isRecording && !wasRecordingRef.current) {
      const currentDescription = draft.description ?? "";
      baseDescriptionRef.current = currentDescription;
      lastAppliedTranscriptionRef.current = currentDescription;
    }

    if (!isRecording && wasRecordingRef.current) {
      baseDescriptionRef.current = null;
      lastAppliedTranscriptionRef.current = null;
    }

    wasRecordingRef.current = isRecording;
  }, [isRecording, draft]);

  useEffect(() => {
    if (!draft || !isRecording) return;

    const base = baseDescriptionRef.current
      ? baseDescriptionRef.current.trim()
      : "";
    const interim = liveTranscription.trim();
    const merged = [base, interim].filter(Boolean).join(" ");

    if (merged === lastAppliedTranscriptionRef.current) {
      return;
    }

    if ((draft.description ?? "") === merged) {
      lastAppliedTranscriptionRef.current = merged;
      return;
    }

    lastAppliedTranscriptionRef.current = merged;
    updateDraft(draft.id, { description: merged });
  }, [draft, isRecording, liveTranscription, updateDraft]);
};

import { useCreationStore } from "@/store/useCreationStore";

export function useDraft(id?: string | null) {
  return useCreationStore((s) => (id ? s.draftsById[id] : undefined));
}


import { useState, useCallback } from "react";

export interface UseModalReturn {
  isVisible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialVisible: boolean = false): UseModalReturn => {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const open = useCallback(() => {
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return {
    isVisible,
    open,
    close,
    toggle,
  };
};
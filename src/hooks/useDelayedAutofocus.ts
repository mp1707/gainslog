import { useCallback, RefObject } from "react";
import { TextInput, InteractionManager } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export const useDelayedAutofocus = (
  inputRef: RefObject<TextInput | null>,
  delay: number = 600
): void => {
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            inputRef.current?.focus();
          }, delay);
        });
      });
      return () => task.cancel();
    }, [inputRef, delay])
  );
};

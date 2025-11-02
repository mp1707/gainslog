import React, { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";

const CalendarTabScreen = () => {
  const [tabFocused, setTabFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setTabFocused(true);
      return () => {
        setTabFocused(false);
      };
    }, [])
  );

  if (!tabFocused) return null;

  return <ScrollView></ScrollView>;
};

export default CalendarTabScreen;

import React from "react";
import { View } from "react-native";
import { Button } from "@/shared/ui/atoms/Button";
import { styles } from "./ManualEntryButton.styles";

interface ManualEntryButtonProps {
  onPress: () => void;
}

export const ManualEntryButton: React.FC<ManualEntryButtonProps> = ({
  onPress,
}) => {
  return (
    <View style={styles.button}>
      <Button onPress={onPress} variant="secondary" size="medium">
        Add Food
      </Button>
    </View>
  );
};

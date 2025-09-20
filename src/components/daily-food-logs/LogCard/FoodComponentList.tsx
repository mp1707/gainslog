import React from "react";
import { View } from "react-native";
import { FoodComponent } from "@/types/models";
import { AppText } from "@/components";

interface FoodComponentListProps {
  foodComponents: FoodComponent[];
  maxItems?: number;
  style?: any;
}

export const FoodComponentList: React.FC<FoodComponentListProps> = ({
  foodComponents,
  maxItems = 3,
  style,
}) => {
  if (foodComponents.length === 0) return null;

  const displayComponents = foodComponents.slice(0, maxItems);
  const hasMore = foodComponents.length > maxItems;

  return (
    <View style={style}>
      {displayComponents.map((component, index) => (
        <AppText key={`${component.name}-${index}`} role="Caption">
          {component.name}
        </AppText>
      ))}
      {hasMore && (
        <AppText role="Caption">...</AppText>
      )}
    </View>
  );
};
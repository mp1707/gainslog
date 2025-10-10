import React, { useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { FoodComponent } from "@/types/models";
import { AppText } from "@/components";

interface FoodComponentListProps {
  foodComponents: FoodComponent[];
  maxItems?: number;
  style?: StyleProp<ViewStyle>;
}

const FoodComponentListComponent: React.FC<FoodComponentListProps> = ({
  foodComponents,
  maxItems = 3,
  style,
}) => {
  if (foodComponents.length === 0) return null;

  const displayComponents = useMemo(
    () => foodComponents.slice(0, maxItems),
    [foodComponents, maxItems],
  );
  const hasMore = displayComponents.length < foodComponents.length;

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

export const FoodComponentList = React.memo(FoodComponentListComponent);

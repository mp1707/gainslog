import React from "react";
import { View } from "react-native";
import { Badge } from "@/shared/ui";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FoodLogCard.styles";
import { AppText, Card } from "src/components";

interface FoodLogCardViewProps {
  title: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  showImageIcon?: boolean;
  confidence?: number;
  showConfidence?: boolean;
  accessoryRight?: React.ReactNode;
}

export const FoodLogCardView: React.FC<FoodLogCardViewProps> = ({
  title,
  description,
  calories,
  protein,
  carbs,
  fat,
  showImageIcon = false,
  confidence,
  showConfidence = false,
  accessoryRight,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.titleSection}>
          <AppText role="Headline" style={styles.title}>
            {title}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {accessoryRight}
            {showConfidence && typeof confidence === "number" ? (
              <Badge confidence={confidence} isLoading={false} />
            ) : null}
          </View>
        </View>
        {description ? (
          <AppText role="Body" color="secondary" style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={styles.bottomSection}>
        {showImageIcon ? <Badge variant="icon" iconType="image" /> : <View />}
        <View style={styles.macroRowContainer}>
          <Badge
            variant="semantic"
            semanticType="calories"
            label={`${calories} kcal`}
          />
          <Badge
            variant="semantic"
            semanticType="protein"
            label={`${protein}g`}
          />
          <Badge variant="semantic" semanticType="carbs" label={`${carbs}g`} />
          <Badge variant="semantic" semanticType="fat" label={`${fat}g`} />
        </View>
      </View>
    </Card>
  );
};

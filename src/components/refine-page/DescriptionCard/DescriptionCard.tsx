import React from "react";
import { AppText, Card } from "@/components";
import { TextInput } from "@/components/shared/TextInput";
import { useTheme } from "@/theme";
import { createStyles } from "./DescriptionCard.styles";

interface DescriptionCardProps {
  value: string;
  onChange: (text: string) => void;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({
  value,
  onChange,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <Card>
      <AppText role="Caption" style={styles.sectionHeader}>
        MEAL DESCRIPTION
      </AppText>
      <TextInput
        placeholder="Description"
        value={value}
        multiline
        onChangeText={onChange}
        fontSize="Body"
        style={[styles.titleInputContainer, styles.titleInput]}
      />
    </Card>
  );
};

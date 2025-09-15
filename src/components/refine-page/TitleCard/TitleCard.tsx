import React from "react";
import { AppText, Card } from "@/components";
import { TextInput } from "@/components/shared/TextInput";
import { useTheme } from "@/theme";
import { createStyles } from "./TitleCard.styles";

interface TitleCardProps {
  value: string;
  onChange: (text: string) => void;
}

export const TitleCard: React.FC<TitleCardProps> = ({ value, onChange }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <Card>
      <AppText role="Caption" style={styles.sectionHeader}>
        TITLE
      </AppText>
      <TextInput
        placeholder="Title"
        value={value}
        onChangeText={onChange}
        fontSize="Headline"
        style={[styles.titleInputContainer, styles.titleInput]}
      />
    </Card>
  );
};

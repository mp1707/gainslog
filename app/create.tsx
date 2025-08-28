import { AppText } from "@/components/shared/AppText";
import { View } from "react-native";

export default function Create() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <AppText style={{ fontSize: 20 }}>This is a full-screen modal 🚀</AppText>
    </View>
  );
}

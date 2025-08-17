import { useEffect } from "react";
import { router } from "expo-router";

// Redirect to step 1 if someone navigates directly to /proteinCalculator
export default function ProteinCalculatorIndexScreen() {
  useEffect(() => {
    router.replace("/settings/proteinCalculator/weight");
  }, []);

  return null;
}
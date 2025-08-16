import { useEffect } from "react";
import { router } from "expo-router";

// Redirect to step 1 if someone navigates directly to /calculator
export default function CalculatorIndexScreen() {
  useEffect(() => {
    router.replace("/settings/calorieCalculator/sex");
  }, []);

  return null;
}
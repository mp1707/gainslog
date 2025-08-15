import { useEffect } from "react";
import { router } from "expo-router";

// Redirect to step 1 if someone navigates directly to /calculator
export default function CalculatorIndexScreen() {
  useEffect(() => {
    router.replace("/settings/calculator/step1-personal-info");
  }, []);

  return null;
}
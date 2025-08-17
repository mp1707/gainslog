import { useEffect } from "react";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";

// Redirect to step 1 if someone navigates directly to /proteinCalculator
export default function ProteinCalculatorIndexScreen() {
  const { safeReplace } = useNavigationGuard();

  useEffect(() => {
    safeReplace("/settings/proteinCalculator/weight");
  }, [safeReplace]);

  return null;
}
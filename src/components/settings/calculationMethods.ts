import { UserSettings } from "@/types/models";

export const ACTIVITY_LEVELS: Record<
  UserSettings["activityLevel"],
  {
    id: UserSettings["activityLevel"];
    titleKey: string;
    descriptionKey: string;
    labelKey: string;
  }
> = {
  sedentary: {
    id: "sedentary",
    titleKey: "onboarding.activityLevel.levels.sedentary.title",
    descriptionKey: "onboarding.activityLevel.levels.sedentary.description",
    labelKey: "onboarding.activityLevel.levels.sedentary.label",
  },
  light: {
    id: "light",
    titleKey: "onboarding.activityLevel.levels.light.title",
    descriptionKey: "onboarding.activityLevel.levels.light.description",
    labelKey: "onboarding.activityLevel.levels.light.label",
  },
  moderate: {
    id: "moderate",
    titleKey: "onboarding.activityLevel.levels.moderate.title",
    descriptionKey: "onboarding.activityLevel.levels.moderate.description",
    labelKey: "onboarding.activityLevel.levels.moderate.label",
  },
  active: {
    id: "active",
    titleKey: "onboarding.activityLevel.levels.active.title",
    descriptionKey: "onboarding.activityLevel.levels.active.description",
    labelKey: "onboarding.activityLevel.levels.active.label",
  },
  veryactive: {
    id: "veryactive",
    titleKey: "onboarding.activityLevel.levels.veryactive.title",
    descriptionKey: "onboarding.activityLevel.levels.veryactive.description",
    labelKey: "onboarding.activityLevel.levels.veryactive.label",
  },
};

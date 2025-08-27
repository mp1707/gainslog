import { UserSettings } from "@/types/models";

export const ACTIVITY_LEVELS: Record<
  UserSettings["activityLevel"],
  {
    id: UserSettings["activityLevel"];
    title: string;
    description: string;
    label: string;
  }
> = {
  sedentary: {
    id: "sedentary",
    title: "Sedentary",
    description:
      "Little to no exercise. Desk job with minimal physical activity throughout the day.",
    label: "Sedentary Lifestyle",
  },
  light: {
    id: "light",
    title: "Light Activity",
    description:
      "Light exercise 1-3 days per week. Some walking or light recreational activities.",
    label: "Lightly Active",
  },
  moderate: {
    id: "moderate",
    title: "Moderate Activity",
    description:
      "Moderate exercise 3-5 days per week. Regular gym sessions or sports activities.",
    label: "Moderately Active",
  },
  active: {
    id: "active",
    title: "Active",
    description:
      "Moderate exercise 6-7 days per week. Or intense training 3 to 4 times/week.",
    label: "Active",
  },
  veryactive: {
    id: "veryactive",
    title: "Very Active",
    description:
      "Very heavy physical work or 6 to 7 times/week intense exercise. Professional athlete level activity.",
    label: "Very Active",
  },
};

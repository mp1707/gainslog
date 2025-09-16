import { FoodLog } from "../types/models";
import { useAppStore } from "../store/useAppStore";
import { generateFoodLogId } from "./idGenerator";
import { testFoodLogs } from "./testData";
import { formatDateToLocalString, parseDateKey } from "@/utils/dateHelpers";

/**
 * Seeds the app with randomized test food logs for the last 120 days
 * Each day gets 15 random food logs from the test data
 */
export const seedFoodLogs = (): void => {
  const seededLogs: FoodLog[] = [];
  const today = new Date();

  // Generate data for the last 120 days
  for (let dayOffset = 0; dayOffset < 700; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - dayOffset);

    // Use local-safe date key (YYYY-MM-DD)
    const logDate = formatDateToLocalString(currentDate);

    // Get a random number betwen 4 and 15 logs per day
    const randomNumberOfLogs = Math.floor(Math.random() * 12) + 4;
    const dailyLogs = getRandomFoodLogs(randomNumberOfLogs, logDate);
    seededLogs.push(...dailyLogs);
  }

  // Set the seeded logs in the store
  useAppStore.getState().setFoodlogs(seededLogs);
};

/**
 * Gets a specified number of random food logs for a given date
 */
const getRandomFoodLogs = (count: number, logDate: string): FoodLog[] => {
  const logs: FoodLog[] = [];
  // Construct a local midnight base time for the given logDate
  const { year, month, day } = parseDateKey(logDate);
  const baseTime = new Date(year, month - 1, day, 0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    // Pick a random test food log
    const randomIndex = Math.floor(Math.random() * testFoodLogs.length);
    const testLog = testFoodLogs[randomIndex];

    // Create a random time within the day (6 AM to 10 PM)
    const randomHour = Math.floor(Math.random() * 16) + 6; // 6-21 (6 AM to 9 PM)
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);

    const createdAt = new Date(baseTime);
    createdAt.setHours(randomHour, randomMinute, randomSecond, 0);

    const foodLog: FoodLog = {
      id: generateFoodLogId(),
      logDate,
      createdAt: createdAt.toISOString(),
      ...testLog,
    };

    logs.push(foodLog);
  }

  // Sort logs by creation time for more realistic ordering
  return logs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

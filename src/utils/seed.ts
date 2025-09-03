import { FoodLog } from "../types/models";
import { useAppStore } from "../store/useAppStore";
import { generateFoodLogId } from "./idGenerator";
import { testFoodLogs } from "./testData";

/**
 * Seeds the app with randomized test food logs for the last 120 days
 * Each day gets 15 random food logs from the test data
 */
export const seedFoodLogs = (): void => {
  const seededLogs: FoodLog[] = [];
  const today = new Date();

  // Generate data for the last 120 days
  for (let dayOffset = 0; dayOffset < 120; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - dayOffset);

    const logDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format

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
  const baseTime = new Date(logDate + "T00:00:00.000Z");

  for (let i = 0; i < count; i++) {
    // Pick a random test food log
    const randomIndex = Math.floor(Math.random() * testFoodLogs.length);
    const testLog = testFoodLogs[randomIndex];

    // Create a random time within the day (6 AM to 10 PM)
    const randomHour = Math.floor(Math.random() * 16) + 6; // 6-21 (6 AM to 9 PM)
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);

    const createdAt = new Date(baseTime);
    createdAt.setUTCHours(randomHour, randomMinute, randomSecond);

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

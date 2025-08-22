/**
 * Generates a unique ID for entities
 * Format: prefix_timestamp_randomString
 */
export const generateId = (prefix: string = "id"): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${randomString}`;
};

export const generateFoodLogId = () => generateId("log");
export const generateFavoriteId = () => generateId("fav");
export const generateWeightLogId = () => generateId("weight");

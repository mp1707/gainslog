type EnvVarName =
  | "EXPO_PUBLIC_SUPABASE_URL"
  | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const getRequiredEnv = (name: EnvVarName): string => {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  get SUPABASE_URL(): string {
    return getRequiredEnv("EXPO_PUBLIC_SUPABASE_URL");
  },
  get SUPABASE_ANON_KEY(): string {
    return getRequiredEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
};

export const isDev = process.env.NODE_ENV !== "production";

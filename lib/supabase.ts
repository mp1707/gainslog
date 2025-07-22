import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export interface FoodEstimateRequest {
  title: string;
  description?: string;
}

export interface FoodEstimateResponse {
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}


/**
 * AI-powered nutrition estimation (OpenAI only, no fallback)
 */
export const estimateFoodAI = async (request: FoodEstimateRequest): Promise<FoodEstimateResponse> => {
  const anonKey = '***REMOVED***';
  
  const response = await fetch('https://cjsbuqvntoimmawozpko.supabase.co/functions/v1/text-based-estimation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI estimation HTTP error:', response.status, errorText);
    throw new Error('AI_ESTIMATION_FAILED');
  }

  const data = await response.json();
  
  if (data.error) {
    console.error('AI estimation error:', data.error);
    throw new Error('AI_ESTIMATION_FAILED');
  }

  return data as FoodEstimateResponse;
};
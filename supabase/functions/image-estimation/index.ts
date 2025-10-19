// deno-lint-ignore-file
// @ts-nocheck
// Image-based nutrition estimation using OpenAI Vision API (New API Key System)
import OpenAI from "jsr:@openai/openai@6.5.0";
import { z } from "npm:zod@3.25.1";
import { zodTextFormat } from "jsr:@openai/openai@6.5.0/helpers/zod";
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.4";
// Initialize Supabase client with service role key for privileged operations
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      persistSession: false,
    },
  }
);
// Fallback response for non-food images or API failures
const INVALID_IMAGE_RESPONSE = {
  generatedTitle: "Invalid Image",
  foodComponents: [],
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
function getClientIp(req) {
  const ipHeader = req.headers.get("x-forwarded-for");
  if (ipHeader) return ipHeader.split(",")[0].trim();
  return "unknown";
}
const SYSTEM_PROMPT = `You are a meticulous nutrition expert for FOOD IMAGE analysis. Given one image (+ optional user text), return exactly ONE JSON object that matches the Zod schema "NutritionEstimation". No prose, no markdown.

RULES
- Follow the schema exactly (no extra keys). Integers only; round half up.
- Units: "g", "ml", "piece" (lowercase, singular). Normalize synonyms: "pcs" → "piece".
- Totals (calories, protein, carbs, fat) must be coherent: kcal ≈ 4*protein + 4*carbs + 9*fat.
- Do NOT invent hidden ingredients (oil, butter, etc.) unless clearly visible.
- Prefer specific names: "grilled chicken breast", "cooked white rice", etc.
- If the image is NOT food: empty foodComponents and all totals 0 with a clear title "🚫 not food".

NULLABLE FIELDS (must always be present but may be null)
- For any component:
  - If unit === "piece", set "recommendedMeasurement" to an exact measurable alternative (e.g., { "amount": 180, "unit": "g" }).
  - Otherwise set "recommendedMeasurement": null.
- "macrosPerReferencePortion": include ONLY if an exact nutrition label with numeric macros and a clear basis is visible; otherwise null.
  - When present, "referencePortionAmount" must be just the numeric amount + unit (e.g., "40 g", "100 ml").

ESTIMATION GUIDANCE
- Components: identify 1–10 visible key items. Estimate amounts via plate size, common utensil sizes, labels in frame, etc.
- Title: one fitting emoji + 1–3 concise words (no punctuation).
- Keep outputs concise and realistic.

OUTPUT
- Return only the JSON object, no trailing text.`;
const openai = new OpenAI();
// ---------- Zod schema (all fields required; “optional” fields are nullable) ----------
const RecommendedMeasurement = z.object({
  amount: z.number().int().nonnegative(),
  unit: z.enum(["g", "ml"]),
});
const FoodComponent = z.object({
  name: z.string(),
  amount: z.number().int().nonnegative(),
  unit: z.enum(["g", "ml", "piece"]),
  // REQUIRED but nullable for Structured Outputs
  recommendedMeasurement: RecommendedMeasurement.nullable(),
});
const MacrosPerReferencePortion = z.object({
  referencePortionAmount: z.string(),
  caloriesForReferencePortion: z.number().int().nonnegative(),
  proteinForReferencePortion: z.number().int().nonnegative(),
  carbsForReferencePortion: z.number().int().nonnegative(),
  fatForReferencePortion: z.number().int().nonnegative(),
});
const NutritionEstimation = z.object({
  generatedTitle: z.string(),
  foodComponents: z.array(FoodComponent),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  // REQUIRED but nullable for Structured Outputs
  macrosPerReferencePortion: MacrosPerReferencePortion.nullable(),
});
// Simple API key validation
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  if (authHeader?.startsWith("Bearer ") || apiKeyHeader) return true;
  return false;
}
Deno.serve(async (req) => {
  const identifier = getClientIp(req);
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    return new Response(
      JSON.stringify({
        error: "AI_ESTIMATION_RATE_LIMIT",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Only POST method allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
  if (!validateApiKey(req)) {
    return new Response(
      JSON.stringify({
        error: "Invalid API key",
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
  try {
    const { imagePath, title, description } = await req.json();
    const bucket = "food-images";
    const expiresIn = 60;
    if (!imagePath?.trim()) {
      return new Response(
        JSON.stringify({
          error: "ImagePath is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(imagePath, expiresIn);
    if (error || !data) {
      console.error("Signed URL error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create signed URL",
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    const imageUrl = data.signedUrl;
    let userPrompt =
      "Analyze this food image and estimate its nutritional content. If you use 'piece' as a unit for a component, ALSO include recommendedMeasurement with an exact amount+unit (e.g., grams or milliliters). If a clear, exact nutrition label is visible, include macrosPerReferencePortion with an exact referencePortionAmount like '40 g' or '100 ml' and integer macros for that portion. ";
    if (title?.trim() || description?.trim()) {
      userPrompt += " Additional context:";
      if (title?.trim()) userPrompt += ` Title: ${title.trim()}.`;
      if (description?.trim())
        userPrompt += ` Description: ${description.trim()}.`;
    }
    // Responses API + Zod Structured Outputs
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt,
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "low",
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(NutritionEstimation, "nutrition_estimate"),
      },
      top_p: 1,
    });
    // SDK-parsed output when using zodTextFormat
    const nutrition =
      response.output_parsed ?? JSON.parse(response.output_text || "{}");
    const ALLOWED_UNITS = ["g", "ml", "piece"];
    const EXACT_UNITS = ["g", "ml"];
    // Sanitize components (no limit on number of components)
    const sanitizedComponents = Array.isArray(nutrition.foodComponents)
      ? nutrition.foodComponents
          .map((comp) => {
            const lowerCaseUnit = String(comp.unit || "").toLowerCase();
            const base = {
              name: String(comp.name || "Unknown Item"),
              amount: Math.max(0, Number(comp.amount) || 0),
              unit: ALLOWED_UNITS.includes(lowerCaseUnit)
                ? lowerCaseUnit
                : "piece",
            };
            // recommendedMeasurement will be null unless unit === "piece"
            if (
              base.unit === "piece" &&
              comp.recommendedMeasurement &&
              typeof comp.recommendedMeasurement === "object"
            ) {
              const rmAmount = Math.max(
                0,
                Number(comp.recommendedMeasurement.amount) || 0
              );
              const rmUnitRaw = String(
                comp.recommendedMeasurement.unit || ""
              ).toLowerCase();
              if (rmAmount > 0 && EXACT_UNITS.includes(rmUnitRaw)) {
                base.recommendedMeasurement = {
                  amount: rmAmount,
                  unit: rmUnitRaw,
                };
              }
            }
            return base;
          })
          .filter((c) => c.name && c.name !== "Unknown Item")
      : [];
    // Optional macrosPerReferencePortion passthrough (will be null when not present)
    let sanitizedReferenceMacros;
    if (
      nutrition.macrosPerReferencePortion &&
      typeof nutrition.macrosPerReferencePortion === "object"
    ) {
      const m = nutrition.macrosPerReferencePortion;
      const amountStr = String(m.referencePortionAmount || "").trim();
      const cal = Math.max(
        0,
        Math.round(Number(m.caloriesForReferencePortion) || 0)
      );
      const pro = Math.max(
        0,
        Math.round(Number(m.proteinForReferencePortion) || 0)
      );
      const car = Math.max(
        0,
        Math.round(Number(m.carbsForReferencePortion) || 0)
      );
      const fat = Math.max(
        0,
        Math.round(Number(m.fatForReferencePortion) || 0)
      );
      if (amountStr) {
        sanitizedReferenceMacros = {
          referencePortionAmount: amountStr,
          caloriesForReferencePortion: cal,
          proteinForReferencePortion: pro,
          carbsForReferencePortion: car,
          fatForReferencePortion: fat,
        };
      }
    }
    const result = {
      generatedTitle: nutrition.generatedTitle || "Food Image Analysis",
      foodComponents: sanitizedComponents,
      calories: Math.max(0, Math.round(nutrition.calories || 0)),
      protein: Math.max(0, Math.round(nutrition.protein || 0)),
      carbs: Math.max(0, Math.round(nutrition.carbs || 0)),
      fat: Math.max(0, Math.round(nutrition.fat || 0)),
    };
    if (sanitizedReferenceMacros) {
      result.macrosPerReferencePortion = sanitizedReferenceMacros;
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.warn("Error validating AI response, using fallback:", error);
    return new Response(JSON.stringify(INVALID_IMAGE_RESPONSE), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});

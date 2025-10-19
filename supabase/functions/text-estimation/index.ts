// Text-based nutrition estimation using OpenAI with component breakdown
// deno-lint-ignore-file
// @ts-nocheck
import OpenAI from "jsr:@openai/openai@6.5.0";
import { z } from "npm:zod@3.25.1";
import { zodTextFormat } from "jsr:@openai/openai@6.5.0/helpers/zod";
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
function getClientIp(req) {
  const ipHeader = req.headers.get("x-forwarded-for");
  if (ipHeader) return ipHeader.split(",")[0].trim();
  return "unknown";
}
// Updated error/fallback response (estimationConfidence removed)
const ERROR_RESPONSE = {
  generatedTitle: "Estimation Error",
  foodComponents: [],
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};
// ⚠️ SYSTEM PROMPT: kept intact (including examples), with ONLY minimal edits needed for Zod Structured Outputs:
// - “no nulls” -> “no nulls EXCEPT where noted”
// - recommendedMeasurement: REQUIRED but nullable (null unless unit === "piece")
const SYSTEM_PROMPT = `You are a meticulous nutrition expert. Analyze a user's text description of a meal and return ONE valid JSON object with your nutritional estimation. Decompose the meal into components.

STRICT OUTPUT RULES
- Return ONLY one JSON object (no prose, no markdown, no trailing text).
- Use EXACTLY the schema below (no extra keys, no nulls EXCEPT where noted).
- All numbers must be integers. Round half up.
- Units must be lowercase and singular.
- Totals (calories, protein, carbs, fat) must be the sum of components and roughly consistent with kcal ≈ 4p + 4c + 9f.

JSON OUTPUT SCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": number,
      "unit": "string",
      // REQUIRED but set to null unless unit is "piece":
      // "recommendedMeasurement": { "amount": number, "unit": "string" } | null
    }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer
}

VALID UNITS (unit field)
"g", "ml", "piece"

UNIT & SYNONYM NORMALIZATION
- Normalize plurals and synonyms:
  * "grams" → "g"
  * "milliliters", "millilitres" → "ml"
  * "pcs", "pieces", "slice", "slices" → "piece"
- Prefer exact measurable units ("g" or "ml").
- Use the ambiguous unit "piece" only when it is the clearest description (e.g., whole apple, burger).
- REQUIRED NULLABILITY: If unit is NOT "piece", set "recommendedMeasurement": null. If unit IS "piece", include a realistic recommended measurement (prefer "g" or "ml").

CORE LOGIC
1) Deconstruct the description into distinct, specific components. Avoid vague catch-alls when detail is implied (e.g., choose "tomato sauce" over "sauce" if context suggests it).
2) Amount handling (CRITICAL):
   - Honor explicit amounts and units from the user.
   - When the user provides a count of items ("2 bananas"), convert to { amount: 2, unit: "piece" } and include a best-fit recommendedMeasurement in grams.
   - If quantities are missing, estimate a sensible single-serving amount and choose "g" or "ml" when possible. Only fall back to "piece" when no better measurable unit fits.
3) Title formatting:
   - generatedTitle starts with ONE fitting emoji followed by 1–3 concise words. No ending punctuation. Example: "🥗 Chicken Bowl".
4) Macros:
   - Provide realistic integers for calories, protein, carbs, and fat across the entire meal.
   - Keep calories roughly consistent with macros via 4/4/9 rule, but prioritize the best domain knowledge estimate when conflicts arise.
   - Respect extreme quantities literally ("100 pancakes" → very high totals).

EXAMPLE SCENARIOS

HIGH SPECIFICITY (user provides quantities)
User: "40 g oats with 200 ml milk and 15 g almonds."
Expected JSON:
{
  "generatedTitle": "🥣 Oats with Milk",
  "foodComponents": [
    { "name": "oats", "amount": 40, "unit": "g", "recommendedMeasurement": null },
    { "name": "milk", "amount": 200, "unit": "ml", "recommendedMeasurement": null },
    { "name": "almonds", "amount": 15, "unit": "g", "recommendedMeasurement": null }
  ],
  "calories": 310,
  "protein": 13,
  "carbs": 34,
  "fat": 14
}

MISSING QUANTITIES (estimate sensible portions)
User: "A bowl of muesli with quark and an apple."
Expected JSON:
{
  "generatedTitle": "🍎 Muesli with Apple",
  "foodComponents": [
    { "name": "muesli", "amount": 60, "unit": "g", "recommendedMeasurement": null },
    { "name": "quark", "amount": 200, "unit": "g", "recommendedMeasurement": null },
    { "name": "apple", "amount": 1, "unit": "piece", "recommendedMeasurement": { "amount": 180, "unit": "g" } }
  ],
  "calories": 460,
  "protein": 26,
  "carbs": 58,
  "fat": 14
}

VERY VAGUE (convert counts to pieces with refinements)
User: "Two slices of pepperoni pizza and a cola."
Expected JSON:
{
  "generatedTitle": "🍕 Pizza & Cola",
  "foodComponents": [
    { "name": "pepperoni pizza slice", "amount": 2, "unit": "piece", "recommendedMeasurement": { "amount": 300, "unit": "g" } },
    { "name": "cola", "amount": 330, "unit": "ml", "recommendedMeasurement": null }
  ],
  "calories": 880,
  "protein": 30,
  "carbs": 98,
  "fat": 38
}

MIXED DETAIL (partially specified)
User: "grilled chicken with rice and vegetables, plus a 250 ml smoothie."
Expected JSON:
{
  "generatedTitle": "🍗 Chicken Plate",
  "foodComponents": [
    { "name": "grilled chicken breast", "amount": 180, "unit": "g", "recommendedMeasurement": null },
    { "name": "cooked white rice", "amount": 150, "unit": "g", "recommendedMeasurement": null },
    { "name": "mixed vegetables", "amount": 100, "unit": "g", "recommendedMeasurement": null },
    { "name": "fruit smoothie", "amount": 250, "unit": "ml", "recommendedMeasurement": null }
  ],
  "calories": 730,
  "protein": 55,
  "carbs": 78,
  "fat": 22
}
`;
const openai = new OpenAI();
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  return authHeader?.startsWith("Bearer ") || apiKeyHeader;
}
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
const NutritionEstimation = z.object({
  generatedTitle: z.string(),
  foodComponents: z.array(FoodComponent),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
});
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { description } = await req.json();
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Description is required and must be a non-empty string.",
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
    const userPrompt = `Estimate the nutrition for the following meal. If you use "piece" for any component, ALSO include "recommendedMeasurement" with a realistic exact amount and unit (prefer grams or milliliters): ${description}`;
    // ▶️ Responses API + Zod Structured Outputs
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
          ],
        },
      ],
      text: {
        // Enforce schema; all fields required; “optional” ones are nullable
        format: zodTextFormat(NutritionEstimation, "nutrition_estimate"),
      },
      top_p: 1,
    });
    // Prefer SDK-parsed output; fallback to raw JSON if needed
    const nutrition =
      response.output_parsed ?? JSON.parse(response.output_text || "{}");
    // Sanitize and structure the final result
    const ALLOWED_UNITS = ["g", "ml", "piece"];
    const EXACT_UNITS = ["g", "ml"];
    const foodComponents = Array.isArray(nutrition.foodComponents)
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
            if (
              base.unit === "piece" &&
              comp.recommendedMeasurement &&
              typeof comp.recommendedMeasurement === "object"
            ) {
              const rmAmount = Math.max(
                0,
                Number(comp.recommendedMeasurement.amount) || 0
              );
              const rmUnit = String(
                comp.recommendedMeasurement.unit || ""
              ).toLowerCase();
              if (rmAmount > 0 && EXACT_UNITS.includes(rmUnit)) {
                base.recommendedMeasurement = {
                  amount: rmAmount,
                  unit: rmUnit,
                };
              }
            }
            return base;
          })
          .filter((c) => c.name && c.name !== "Unknown Item")
      : [];
    const result = {
      generatedTitle: nutrition.generatedTitle || "AI Estimate",
      foodComponents,
      calories: Math.max(0, Math.round(nutrition.calories || 0)),
      protein: Math.max(0, Math.round(nutrition.protein || 0)),
      carbs: Math.max(0, Math.round(nutrition.carbs || 0)),
      fat: Math.max(0, Math.round(nutrition.fat || 0)),
    };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in text-based estimation:", error);
    return new Response(JSON.stringify(ERROR_RESPONSE), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

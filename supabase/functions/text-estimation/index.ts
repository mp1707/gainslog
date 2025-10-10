// Text-based nutrition estimation using OpenAI with component breakdown
// deno-lint-ignore-file
// @ts-nocheck
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
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
// UPDATED SYSTEM PROMPT:
// - Adds OPTIONAL per-component "recommendedMeasurement" when unit is ambiguous ("piece" or "serving").
// - Removes any mention of estimationConfidence.
const SYSTEM_PROMPT = `You are a meticulous nutrition expert. Analyze a user's text description of a meal and return a single, valid JSON object with your nutritional estimation. Decompose the meal into components.

STRICT OUTPUT RULES
- Return ONLY one JSON object (no prose, no markdown).
- Use EXACTLY the schema below (no extra keys, no nulls).
- All numbers must be integers. Round half up.
- Units must be lowercase and singular.
- Sum macros from components to produce the totals.

JSON OUTPUT SCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": number,
      "unit": "string",
      "needsRefinement": boolean,
      // OPTIONAL — include ONLY when unit is "piece" or "serving"
      // "recommendedMeasurement": { "amount": number, "unit": "string" }
    }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer
}

VALID UNITS (unit field)
"g", "oz", "ml", "fl oz", "cup", "tbsp", "tsp", "scoop", "piece", "serving"

UNIT & SYNONYM NORMALIZATION
- Normalize plurals and synonyms to the valid list:
  * "slices", "slice", "pcs" → "piece"
  * "tablespoons" → "tbsp", "teaspoons" → "tsp"
  * "cups" → "cup", "ounces" → "oz", "fluid ounces" → "fl oz"
- Vague units ("serving", "piece") are allowed but usually require needsRefinement: true unless a standard size is explicit (e.g., "1 cup").
- When using "piece"/"serving", ALSO add "recommendedMeasurement" with a realistic exact alternative (prefer "g" or "ml" when appropriate), e.g., a medium apple → {"amount": 180, "unit": "g"}.

CORE LOGIC
1) Deconstruct:
   - Parse the description into distinct ingredients/components.
   - Avoid generic catch-alls like "sauce" if specifics are present (e.g., "tomato sauce", "pesto").
2) Amount handling (CRITICAL):
   - If user provides a specific quantity (e.g., "150 g chicken", "2 slices bread"), set that amount/unit and needsRefinement: false.
   - If not provided, estimate a reasonable standard portion; set needsRefinement: true.
   - If the unit is vague ("serving" or "piece"), estimate and set needsRefinement: true and add "recommendedMeasurement".
3) Title:
   - generatedTitle starts with ONE fitting emoji + 1–3 concise words. No trailing punctuation. Example: "🥗 Chicken Bowl".
4) Macros:
   - Provide realistic integers for calories, protein, carbs, fat as totals across components.
   - Ensure calories≈(protein*4 + carbs*4 + fat*9) within a reasonable margin.
   - Extreme inputs ARE possible and must be calculated literally (e.g., "100 pizzas" is 100 pizzas).

EXAMPLE SCENARIOS

HIGH SPECIFICITY (user provides quantities)
User: "40g oats with 20g nuts and 1 cup of milk."
Expected JSON:
{
  "generatedTitle": "🥣 Oats with Nuts",
  "foodComponents": [
    { "name": "oats", "amount": 40, "unit": "g", "needsRefinement": false },
    { "name": "nuts", "amount": 20, "unit": "g", "needsRefinement": false },
    { "name": "milk", "amount": 1, "unit": "cup", "needsRefinement": false }
  ],
  "calories": 450,
  "protein": 15,
  "carbs": 40,
  "fat": 25
}

MISSING QUANTITIES (estimate sensible portions)
User: "A bowl of muesli with quark and an apple."
Expected JSON:
{
  "generatedTitle": "🍎 Muesli with Apple",
  "foodComponents": [
    { "name": "muesli", "amount": 60, "unit": "g", "needsRefinement": true },
    { "name": "quark", "amount": 250, "unit": "g", "needsRefinement": true },
    { "name": "apple", "amount": 1, "unit": "piece", "needsRefinement": true, "recommendedMeasurement": { "amount": 180, "unit": "g" } }
  ],
  "calories": 480,
  "protein": 28,
  "carbs": 60,
  "fat": 14
}

VERY VAGUE (use typical assumptions)
User: "Had a sandwich and a soda."
Expected JSON:
{
  "generatedTitle": "🥪 Sandwich & Soda",
  "foodComponents": [
    { "name": "sandwich (ham & cheese, white bread)", "amount": 1, "unit": "piece", "needsRefinement": true, "recommendedMeasurement": { "amount": 250, "unit": "g" } },
    { "name": "cola", "amount": 330, "unit": "ml", "needsRefinement": true }
  ],
  "calories": 620,
  "protein": 22,
  "carbs": 82,
  "fat": 20
}

COMPLETE, MIXED UNITS
User: "200g grilled chicken, 150g cooked rice, 80g broccoli, 1 tbsp olive oil."
Expected JSON:
{
  "generatedTitle": "🍗 Chicken Plate",
  "foodComponents": [
    { "name": "grilled chicken breast", "amount": 200, "unit": "g", "needsRefinement": false },
    { "name": "cooked white rice", "amount": 150, "unit": "g", "needsRefinement": false },
    { "name": "broccoli", "amount": 80, "unit": "g", "needsRefinement": false },
    { "name": "olive oil", "amount": 1, "unit": "tbsp", "needsRefinement": false }
  ],
  "calories": 720,
  "protein": 63,
  "carbs": 56,
  "fat": 26
}
`;
const openai = new OpenAI();
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  return authHeader?.startsWith("Bearer ") || apiKeyHeader;
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
    const userPrompt = `Estimate the nutrition for the following meal. If you use an ambiguous unit ("piece" or "serving") for any component, ALSO include "recommendedMeasurement" with a realistic exact amount and unit (prefer grams or milliliters): ${description}.`;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      verbosity: "medium",
      reasoning_effort: "low",
    });
    const messageContent = chatCompletion.choices[0].message.content;
    if (!messageContent) throw new Error("AI returned an empty message.");
    const nutrition = JSON.parse(messageContent);
    // Sanitize and structure the final result with the new foodComponents field
    const ALLOWED_UNITS = [
      "g",
      "oz",
      "ml",
      "fl oz",
      "cup",
      "tbsp",
      "tsp",
      "scoop",
      "piece",
      "serving",
    ];
    const EXACT_UNITS = [
      "g",
      "oz",
      "ml",
      "fl oz",
      "cup",
      "tbsp",
      "tsp",
      "scoop",
    ];
    const result = {
      generatedTitle: nutrition.generatedTitle || "AI Estimate",
      foodComponents: Array.isArray(nutrition.foodComponents)
        ? nutrition.foodComponents
            .map((comp) => {
              const lowerCaseUnit = String(comp.unit || "").toLowerCase();
              const base = {
                name: String(comp.name || "Unknown Item"),
                amount: Math.max(0, Number(comp.amount) || 0),
                unit: ALLOWED_UNITS.includes(lowerCaseUnit)
                  ? lowerCaseUnit
                  : "piece",
                needsRefinement:
                  typeof comp.needsRefinement === "boolean"
                    ? comp.needsRefinement
                    : true,
              };
              // Pass through recommendedMeasurement if present and sane
              if (
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
            .filter((comp) => comp.name && comp.name !== "Unknown Item")
        : [],
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

// deno-lint-ignore-file
// @ts-nocheck
// Image-based nutrition estimation using OpenAI Vision API (New API Key System)
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
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

const SYSTEM_PROMPT = `You are a meticulous nutrition expert specializing in food IMAGE analysis. Analyze a single food image (plus any optional user text) and return ONE valid JSON object with your nutritional estimation. Decompose the meal into components.

STRICT OUTPUT RULES
- Return ONLY one JSON object (no prose, no markdown, no trailing text).
- Use EXACTLY the schema rules below (no extra keys, no nulls).
- All numbers must be integers. Round half up.
- Units must be lowercase and singular.
- Totals (calories, protein, carbs, fat) must be the sum of components and roughly consistent with kcal ≈ 4p + 4c + 9f.
- OPTIONAL FIELD POLICY (label basis): Include "macrosPerReferencePortion" ONLY if the image shows an exact printed nutrition label with numeric macro values tied to a clear basis (e.g., "per 100 g", "per 1 serving (40 g)"). If not exact, omit this field entirely.
- OPTIONAL FIELD POLICY (recommendedMeasurement): If you output the ambiguous unit "piece" for a component, ALSO include a "recommendedMeasurement" with an exact measurable alternative (e.g., grams or milliliters) that best fits the item. This gives the user a precise option to accept later.

JSON OUTPUT SCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": number,
      "unit": "string",
      // OPTIONAL — include ONLY when unit is "piece"
      // "recommendedMeasurement": { "amount": number, "unit": "string" }
    }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer,
  // OPTIONAL — include ONLY when an exact nutrition label is visible and unambiguous:
  // "macrosPerReferencePortion": {
  //   "referencePortionAmount": "string",          // EXACT amount string like "40 g" or "100 ml" (no extra words)
  //   "caloriesForReferencePortion": integer,
  //   "proteinForReferencePortion": integer,
  //   "carbsForReferencePortion": integer,
  //   "fatForReferencePortion": integer
  // }
}

VALID UNITS (unit fields)
"g", "ml", "piece"

UNIT & SYNONYM NORMALIZATION
- Normalize plurals and synonyms:
  * "pcs" → "piece"
- Prefer units that are exact ("g" or "ml")
- Only use the ambiguous unit "piece" if it makes more sense than exact ones (for example an apple is usually described as 1 piece)
- When using "piece", ALSO provide "recommendedMeasurement" with a realistic exact amount and unit (prefer "g" or "ml" when appropriate).

CORE LOGIC
1) Food check:
   - If the image does NOT contain food, return a valid JSON with empty foodComponents and all totals 0, and a clear title (see "INVALID IMAGE TEMPLATE" below). Do NOT invent components.
2) Deconstruct:
   - Identify 1–10 key components visible in the image. Prefer specificity ("grilled chicken breast" over "chicken"; "cooked white rice" over "rice").
   - Do not hallucinate hidden ingredients (e.g., butter/oil) unless clearly visible (oil sheen, sauce puddle).
3) Amount handling (CRITICAL):
   - From the image, estimate quantities using visual cues (plate size, standard utensil sizes, package labels, measuring cups/spoons, can volumes).
   - If you choose "piece", ALSO add "recommendedMeasurement" with a best-fit exact alternative (e.g., a medium apple → {"amount": 180, "unit": "g"}).
4) Nutrition label extraction (OPTIONAL "macrosPerReferencePortion"):
   - Include ONLY if a clear nutrition facts/label with exact numeric macros is visible.
   - Extract the basis as "referencePortionAmount": a concise string containing only the numeric value and unit (e.g., "40 g", "100 ml", "8 oz").
   - If both a serving phrase and a gram/milliliter amount are shown (e.g., "per 1 serving (40 g)"), use the precise measurable basis: "40 g".
   - Omit "macrosPerReferencePortion" if the basis or macro values are not fully visible and exact.
5) Title:
   - generatedTitle starts with ONE fitting emoji + 1–3 concise words (no punctuation). Examples: "🍛 Curry Plate", "🥗 Chicken Bowl".
6) Macros:
   - Provide realistic integers for calories, protein, carbs, fat as totals across components.
   - Keep kcal consistent with macros (1g protein = 4 kcal, 1g carbs = 4 kcal, 1g fat = 9 kcal).

EXAMPLES

AMBIGUOUS UNIT WITH RECOMMENDED MEASUREMENT
User/Image context: a medium apple.
Expected JSON: {
  "generatedTitle": "🍏 Medium Apple",
  "foodComponents": [
    {
      "name": "medium apple",
      "amount": 1,
      "unit": "piece",
      "recommendedMeasurement": { "amount": 180, "unit": "g" }
    }
  ],
  "calories": 95,
  "protein": 0,
  "carbs": 25,
  "fat": 0
}

HIGH CONFIDENCE (visible scale + labeled portions)
User/Image context: A plate with grilled chicken on a digital scale reading “180 g”, rice in a bowl labeled “200 g”, and steamed broccoli on a small plate tagged “60 g”.
Expected JSON:
{
  "generatedTitle": "🍗 Chicken & Rice",
  "foodComponents": [
    { "name": "grilled chicken breast", "amount": 180, "unit": "g" },
    { "name": "cooked white rice", "amount": 200, "unit": "g" },
    { "name": "steamed broccoli", "amount": 60, "unit": "g" }
  ],
  "calories": 620,
  "protein": 50,
  "carbs": 68,
  "fat": 16
}

MEDIUM CONFIDENCE (clear but no exact measures)
User/Image context: A burger on a dinner plate with a side of fries and a small ketchup cup.
Expected JSON:
{
  "generatedTitle": "🍔 Burger & Fries",
  "foodComponents": [
    { "name": "cheeseburger", "amount": 1, "unit": "piece", "recommendedMeasurement": { "amount": 250, "unit": "g" } },
    { "name": "french fries", "amount": 120, "unit": "g" },
    { "name": "ketchup", "amount": 30, "unit": "ml" }
  ],
  "calories": 820,
  "protein": 30,
  "carbs": 82,
  "fat": 40
}

LOW CONFIDENCE (ambiguous container; partial occlusion)
User/Image context: A takeout soup cup with creamy soup; size unclear; spoon blocks view; bread may be present off-frame.
Expected JSON:
{
  "generatedTitle": "🥣 Creamy Soup",
  "foodComponents": [
    { "name": "cream-based soup (estimate)", "amount": 300, "unit": "ml" }
  ],
  "calories": 270,
  "protein": 6,
  "carbs": 18,
  "fat": 18
}

NUTRITION LABEL PRESENT (include macrosPerReferencePortion)
User/Image context: A packaged granola bar with label: "Per 1 serving (40 g): 190 kcal • Protein 6 g • Carbs 24 g • Fat 7 g."
Expected JSON:
{
  "generatedTitle": "🍫 Granola Bar",
  "foodComponents": [
    { "name": "granola bar", "amount": 1, "unit": "piece", "recommendedMeasurement": { "amount": 40, "unit": "g" } }
  ],
  "calories": 190,
  "protein": 6,
  "carbs": 24,
  "fat": 7,
  "macrosPerReferencePortion": {
    "referencePortionAmount": "40 g",
    "caloriesForReferencePortion": 190,
    "proteinForReferencePortion": 6,
    "carbsForReferencePortion": 24,
    "fatForReferencePortion": 7
  }
}

INVALID IMAGE TEMPLATE (no food)
Return this shape if the image is not food:
{
  "generatedTitle": "🚫 Not Food",
  "foodComponents": [],
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}
`;
const openai = new OpenAI();
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
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ];
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
      response_format: {
        type: "json_object",
      },
      verbosity: "low",
      reasoning_effort: "low",
    });
    const messageContent = chatCompletion.choices?.[0]?.message?.content;
    if (!messageContent) throw new Error("AI returned an empty message.");
    const nutrition = JSON.parse(messageContent);
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
    // Sanitize components (no limit on number of components)
    const sanitizedComponents = Array.isArray(nutrition.foodComponents)
      ? nutrition.foodComponents
          .map((comp) => {
            const lowerCaseUnit = String(comp.unit || "").toLowerCase();
            // Base component
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
            // Optional recommendedMeasurement passthrough (normalize unit if present)
            if (
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
          .filter((comp) => comp.name && comp.name !== "Unknown Item")
      : [];
    // Optional macrosPerReferencePortion passthrough (no complex sanitization)
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

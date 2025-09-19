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
  estimationConfidence: 0,
};
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
function getClientIp(req) {
  const ipHeader = req.headers.get("x-forwarded-for");
  if (ipHeader) {
    return ipHeader.split(",")[0].trim();
  }
  return "unknown";
}
// Enhanced system prompt for image analysis with the new structure
const SYSTEM_PROMPT = `You are a meticulous nutrition expert specializing in food IMAGE analysis. Analyze a single food image (plus any optional user text) and return ONE valid JSON object with your nutritional estimation. Decompose the meal into components.

STRICT OUTPUT RULES
- Return ONLY one JSON object (no prose, no markdown, no trailing text).
- Use EXACTLY the schema below (no extra keys, no nulls).
- All numbers must be integers. Round half up.
- Units must be lowercase and singular.
- Totals (calories, protein, carbs, fat) must be the sum of components and roughly consistent with kcal ≈ 4p + 4c + 9f.

JSON OUTPUT SCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    { "name": "string", "amount": number, "unit": "string", "needsRefinement": boolean }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer,
  "estimationConfidence": integer
}

VALID UNITS (unit field)
"g", "oz", "ml", "fl oz", "cup", "tbsp", "tsp", "scoop", "piece", "serving"

UNIT & SYNONYM NORMALIZATION
- Normalize plurals and synonyms:
  * "slices", "slice", "pcs" → "piece"
  * "tablespoons" → "tbsp", "teaspoons" → "tsp"
  * "cups" → "cup", "ounces" → "oz", "fluid ounces" → "fl oz"
- Vague units ("serving", "piece") are allowed but typically require needsRefinement: true unless a standard size is explicit (e.g., "1 cup").

CORE LOGIC
1) Food check:
   - If the image does NOT contain food, return a valid JSON with empty foodComponents, all totals 0, estimationConfidence: 0, and a clear title (see "INVALID IMAGE TEMPLATE" below). Do NOT invent components.
2) Deconstruct:
   - Identify 1–5 key components visible in the image. Prefer specificity ("grilled chicken breast" over "chicken"; "cooked white rice" over "rice").
   - Do not hallucinate hidden ingredients (e.g., butter/oil) unless clearly visible (oil sheen, sauce puddle).
3) Amount handling (CRITICAL):
   - From the image, estimate quantities using visual cues (plate size, standard utensil sizes, package labels, measuring cups/spoons, can volumes).
   - Set needsRefinement: true for IMAGE-based estimates.
   - EXCEPTION: If an exact quantity is visible in the image (e.g., digital scale shows "180 g") OR provided in the user text (e.g., "this is 150 g chicken") OR clearly printed on packaging (e.g., "330 ml"), set needsRefinement: false for that item.
4) Title:
   - generatedTitle starts with ONE fitting emoji + 1–3 concise words (no punctuation). Examples: "🍛 Curry Plate", "🥗 Chicken Bowl".
5) Estimation Confidence (1–100; information quality):
   - High (90–100): Very clear photo; major components have exact amounts via visible scale/labels/standard measures or user-provided quantities; most needsRefinement=false.
   - Medium (50–89): Clear photo but portions inferred from context; mixed needsRefinement, no precise labels.
   - Low (1–49): Blurry/occluded/poor lighting; sizes highly uncertain; most needsRefinement=true.
   - 0: Not a food image (see template).
6) Macros:
   - Provide realistic integers for calories, protein, carbs, fat as totals across components.
   - Keep kcal consistent with macros (tolerance ±10%).

EXAMPLES

HIGH CONFIDENCE (visible scale + measuring cup)
User/Image context: A plate with grilled chicken on a digital scale reading “180 g”, rice in a measuring cup labeled “1 cup”, and steamed broccoli.
Expected JSON:
{
  "generatedTitle": "🍗 Chicken & Rice",
  "foodComponents": [
    { "name": "grilled chicken breast", "amount": 180, "unit": "g", "needsRefinement": false },
    { "name": "cooked white rice", "amount": 1, "unit": "cup", "needsRefinement": false },
    { "name": "broccoli", "amount": 80, "unit": "g", "needsRefinement": true }
  ],
  "calories": 690,
  "protein": 55,
  "carbs": 72,
  "fat": 18,
  "estimationConfidence": 93
}

MEDIUM CONFIDENCE (clear but no exact measures)
User/Image context: A burger on a dinner plate with a side of fries and a small ketchup dollop.
Expected JSON:
{
  "generatedTitle": "🍔 Burger & Fries",
  "foodComponents": [
    { "name": "cheeseburger", "amount": 1, "unit": "piece", "needsRefinement": true },
    { "name": "french fries", "amount": 120, "unit": "g", "needsRefinement": true },
    { "name": "ketchup", "amount": 1, "unit": "tbsp", "needsRefinement": true }
  ],
  "calories": 820,
  "protein": 30,
  "carbs": 85,
  "fat": 40,
  "estimationConfidence": 68
}

LOW CONFIDENCE (ambiguous container; partial occlusion)
User/Image context: A takeout soup cup with creamy soup; size unclear; spoon blocks view; bread may be present off-frame.
Expected JSON:
{
  "generatedTitle": "🥣 Creamy Soup",
  "foodComponents": [
    { "name": "cream-based soup (estimate)", "amount": 300, "unit": "ml", "needsRefinement": true }
  ],
  "calories": 270,
  "protein": 6,
  "carbs": 18,
  "fat": 18,
  "estimationConfidence": 38
}

INVALID IMAGE TEMPLATE (no food)
Return this shape if the image is not food:
{
  "generatedTitle": "🚫 Not Food",
  "foodComponents": [],
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "estimationConfidence": 0
}
`;
const openai = new OpenAI();
// Simple API key validation
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  if (authHeader?.startsWith("Bearer ") || apiKeyHeader) {
    return true;
  }
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
      "Analyze this food image and estimate its nutritional content.";
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
      model: "gpt-4o-mini",
      messages,
      response_format: {
        type: "json_object",
      },
      temperature: 0.2,
      max_completion_tokens: 1000,
    });
    const messageContent = chatCompletion.choices[0].message.content;
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
    const result = {
      generatedTitle: nutrition.generatedTitle || "Food Image Analysis",
      foodComponents: Array.isArray(nutrition.foodComponents)
        ? nutrition.foodComponents
            .slice(0, 5)
            .map((comp) => {
              const lowerCaseUnit = String(comp.unit || "").toLowerCase();
              return {
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
            })
            .filter((comp) => comp.name && comp.name !== "Unknown Item")
        : [],
      calories: Math.max(0, Math.round(nutrition.calories || 0)),
      protein: Math.max(0, Math.round(nutrition.protein || 0)),
      carbs: Math.max(0, Math.round(nutrition.carbs || 0)),
      fat: Math.max(0, Math.round(nutrition.fat || 0)),
      estimationConfidence: Math.max(
        0,
        Math.min(100, Math.round(nutrition.estimationConfidence || 0))
      ),
    };
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
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

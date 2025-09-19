// deno-lint-ignore-file
// @ts-nocheck
// Image-based nutrition estimation using OpenAI Vision API (New API Key System)
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.4";
// Initialize Supabase client with service role key for privileged operations
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: {
    persistSession: false
  }
});
// Fallback response for non-food images or API failures
const INVALID_IMAGE_RESPONSE = {
  generatedTitle: "Invalid Image",
  foodComponents: [],
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  estimationConfidence: 0
};
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit"
});
function getClientIp(req) {
  const ipHeader = req.headers.get("x-forwarded-for");
  if (ipHeader) {
    return ipHeader.split(",")[0].trim();
  }
  return "unknown";
}
// Enhanced system prompt for image analysis with the new structure
const SYSTEM_PROMPT = `You are a meticulous nutrition expert specializing in food image analysis. Your primary task is to analyze a food image and return a single, valid JSON object with your nutritional estimation.

### JSON Output Structure
You MUST return a JSON object with this exact structure:
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": "number",
      "unit": "string",
      "needsRefinement": "boolean"
    }
  ],
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer",
  "estimationConfidence": "integer"
}

### Valid Units for the 'unit' field:
You MUST use one of the following strings for the unit: "g", "oz", "ml", "fl oz", "cup", "tbsp", "tsp", "scoop", "piece", "serving".

### Detailed Instructions for Each Field

1.  **generatedTitle (string):**
    * Create a very short, descriptive title for the meal.

2.  **foodComponents (array of objects):**
    * Identify 1-5 key components. Estimate their portion size from the image.
    * **amount (number):** Your numeric estimate of the quantity.
    * **unit (string):** The appropriate unit from the valid list.
    * **needsRefinement (boolean):** Since you are estimating from an image, this MUST be set to \`true\`. The only exception is if the user provides a specific quantity in the text prompt (e.g., "this is 150g of chicken") or in the image(e.g. via photographed nutrition table), in which case you can set it to \`false\` for that specific item.

3.  **calories, protein, carbs, fat (all integers):**
    * Estimate totals for all food components visible in the image.

4.  **estimationConfidence (1-100 integer):**
    * **High (80-100):** Very clear photo where portion sizes are obvious or the description has exact amounts.
    * **Medium (50-79):** Reasonable clarity, but portions are harder to judge and description is lacking exact amounts or does not exist.
    * **Low (1-49):** Blurry image or ambiguous items.
    * **0:** Not a food image.

### Guidelines
- First, check if the image contains food. If not, return the Invalid Image response.
- Be conservative if unsure.
- Never output explanations, only the JSON.

### Example
{
  "generatedTitle": "Grilled Chicken with Rice",
  "foodComponents": [
    {"name":"Chicken Breast","amount": 150, "unit": "g", "needsRefinement": true},
    {"name":"White Rice","amount": 1, "unit": "cup", "needsRefinement": true}
  ],
  "calories": 520,
  "protein": 45,
  "carbs": 55,
  "fat": 8,
  "estimationConfidence": 75
}`;
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
Deno.serve(async (req)=>{
  const identifier = getClientIp(req);
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    return new Response(JSON.stringify({
      error: "AI_ESTIMATION_RATE_LIMIT"
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Only POST method allowed"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  if (!validateApiKey(req)) {
    return new Response(JSON.stringify({
      error: "Invalid API key"
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const { imagePath, title, description } = await req.json();
    const bucket = "food-images";
    const expiresIn = 60;
    if (!imagePath?.trim()) {
      return new Response(JSON.stringify({
        error: "ImagePath is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(imagePath, expiresIn);
    if (error || !data) {
      console.error("Signed URL error:", error);
      return new Response(JSON.stringify({
        error: "Failed to create signed URL"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const imageUrl = data.signedUrl;
    let userPrompt = "Analyze this food image and estimate its nutritional content.";
    if (title?.trim() || description?.trim()) {
      userPrompt += " Additional context:";
      if (title?.trim()) userPrompt += ` Title: ${title.trim()}.`;
      if (description?.trim()) userPrompt += ` Description: ${description.trim()}.`;
    }
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ];
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        type: "json_object"
      },
      temperature: 0.2,
      max_completion_tokens: 1000
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
      "serving"
    ];
    const result = {
      generatedTitle: nutrition.generatedTitle || "Food Image Analysis",
      foodComponents: Array.isArray(nutrition.foodComponents) ? nutrition.foodComponents.slice(0, 5).map((comp)=>{
        const lowerCaseUnit = String(comp.unit || '').toLowerCase();
        return {
          name: String(comp.name || 'Unknown Item'),
          amount: Math.max(0, Number(comp.amount) || 0),
          unit: ALLOWED_UNITS.includes(lowerCaseUnit) ? lowerCaseUnit : 'piece',
          needsRefinement: typeof comp.needsRefinement === 'boolean' ? comp.needsRefinement : true
        };
      }).filter((comp)=>comp.name && comp.name !== 'Unknown Item') : [],
      calories: Math.max(0, Math.round(nutrition.calories || 0)),
      protein: Math.max(0, Math.round(nutrition.protein || 0)),
      carbs: Math.max(0, Math.round(nutrition.carbs || 0)),
      fat: Math.max(0, Math.round(nutrition.fat || 0)),
      estimationConfidence: Math.max(0, Math.min(100, Math.round(nutrition.estimationConfidence || 0)))
    };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.warn("Error validating AI response, using fallback:", error);
    return new Response(JSON.stringify(INVALID_IMAGE_RESPONSE), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

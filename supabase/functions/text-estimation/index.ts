// Text-based nutrition estimation using OpenAI with component breakdown
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
import { Ratelimit } from "https://cdn.skypack.dev/@upstash/ratelimit@latest";
import { Redis } from "https://deno.land/x/upstash_redis@v1.19.3/mod.ts";
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit"
});
function getClientIp(req) {
  const ipHeader = req.headers.get('x-forwarded-for');
  if (ipHeader) {
    return ipHeader.split(',')[0].trim();
  }
  return 'unknown';
}
// Updated error/fallback response to match the new data structure
const ERROR_RESPONSE = {
  generatedTitle: "Estimation Error",
  foodComponents: [],
  estimationConfidence: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};
const SYSTEM_PROMPT = `You are a meticulous nutrition expert. Your primary task is to analyze a user's text description of a meal and return a single, valid JSON object with your nutritional estimation. You must break the meal down into its components.

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

### Core Instructions: Component Breakdown & Amount Estimation

1.  **Deconstruct the Input:** Break the user's description into individual ingredients and populate the \`foodComponents\` array.
2.  **Amount Handling (CRITICAL):**
    * If the user provides a **specific quantity** (e.g., "150g chicken", "2 slices of bread"), you MUST parse the amount and unit, and set \`needsRefinement\` to \`false\`.
    * If the user does **NOT** provide a quantity (e.g., "chicken breast", "bread"), you MUST estimate a reasonable, standard portion size. For these estimations, you MUST set \`needsRefinement\` to \`true\`.

### Field-Specific Instructions

1.  **generatedTitle (string):**
    * Start with one fitting Emoji and follow up with a very short title to describe the meal. One or two words is ideal.

2.  **estimationConfidence (integer, 1-100):**
    * **High (90-100):** User provides specific ingredients with precise quantities for ALL major components. \`needsRefinement\` should be mostly \`false\`.
    * **Medium (50-89):** User provides specific ingredients but omits some or all quantities. Some \`needsRefinement\` flags will be \`true\`.
    * **Low (1-49):** Input is vague or generic (e.g., "a sandwich", "cereal"). Most \`needsRefinement\` flags will be \`true\`.

3.  **calories, protein, carbs, fat (all integers):**
    * Calculate the total nutrition by summing the values from the \`foodComponents\` array.

### Example Scenarios

#### High Confidence Example (User provides quantities):
* **User Input:** "40g oats with 20g nuts and 1 cup of milk."
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "🥣 Oats with Nuts",
      "foodComponents": [
        { "name": "Oats", "amount": 40, "unit": "g", "needsRefinement": false },
        { "name": "Nuts", "amount": 20, "unit": "g", "needsRefinement": false },
        { "name": "Milk", "amount": 1, "unit": "cup", "needsRefinement": false }
      ],
      "calories": 450,
      "protein": 15,
      "carbs": 40,
      "fat": 25,
      "estimationConfidence": 95
    }
    \`\`\`

#### Medium Confidence Example (User omits quantities):
* **User Input:** "A bowl of muesli with quark and an apple."
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "🍎 Muesli with Apple",
      "foodComponents": [
        { "name": "Muesli", "amount": 60, "unit": "g", "needsRefinement": true },
        { "name": "Quark", "amount": 250, "unit": "g", "needsRefinement": true },
        { "name": "Apple", "amount": 1, "unit": "piece", "needsRefinement": true }
      ],
      "calories": 480,
      "protein": 28,
      "carbs": 60,
      "fat": 14,
      "estimationConfidence": 55
    }
    \`\`\`
`;
const openai = new OpenAI();
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
      error: 'AI_ESTIMATION_RATE_LIMIT'
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
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
    const { description } = await req.json();
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Description is required and must be a non-empty string.'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const userPrompt = `Estimate the nutrition for the following meal: ${description}.`;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: {
        type: "json_object"
      },
      temperature: 0.1
    });
    const messageContent = chatCompletion.choices[0].message.content;
    if (!messageContent) {
      throw new Error("AI returned an empty message.");
    }
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
      "serving"
    ];
    const result = {
      generatedTitle: nutrition.generatedTitle || "AI Estimate",
      foodComponents: nutrition.foodComponents && Array.isArray(nutrition.foodComponents) ? nutrition.foodComponents.map((comp)=>{
        const lowerCaseUnit = String(comp.unit || '').toLowerCase();
        return {
          name: String(comp.name || 'Unknown Item'),
          amount: Math.max(0, Number(comp.amount) || 0),
          unit: ALLOWED_UNITS.includes(lowerCaseUnit) ? lowerCaseUnit : 'piece',
          needsRefinement: typeof comp.needsRefinement === 'boolean' ? comp.needsRefinement : true
        };
      }).filter((comp)=>comp.name && comp.name !== 'Unknown Item') : [],
      estimationConfidence: Math.max(1, Math.min(100, Math.round(nutrition.estimationConfidence || 10))),
      calories: Math.max(0, Math.round(nutrition.calories || 0)),
      protein: Math.max(0, Math.round(nutrition.protein || 0)),
      carbs: Math.max(0, Math.round(nutrition.carbs || 0)),
      fat: Math.max(0, Math.round(nutrition.fat || 0))
    };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in text-based estimation:", error);
    return new Response(JSON.stringify(ERROR_RESPONSE), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

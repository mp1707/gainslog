// functions/refine-nutrition/index.ts
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
  return ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
}
const ERROR_RESPONSE = {
  generatedTitle: "Refinement Error",
  foodComponents: [],
  estimationConfidence: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};
// Base prompt (NO label basis present)
const SYSTEM_PROMPT_BASE = `You are a precision nutrition calculator AI. Your task is to take a list of food components and accurately calculate the total nutritional values of all components combined.

### JSON Output Structure
You MUST return a JSON object with this exact structure:
{
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer"
}

### CRITICAL INSTRUCTIONS:

**CALCULATE NUTRITION:** Your primary task is to calculate the total macros of all components combined ("calories", "protein", "carbs", "fat"). Even if the inputs seem unrealistic to you still calculate the totals.

**METHOD:** Estimate per-component macros using common nutrition knowledge (typical values for the named foods and units) and sum them. Return integers. Keep kcal roughly consistent with macros (kcal ≈ 4*protein + 4*carbs + 9*fat; small deviation is acceptable).

Do not include any explanation or extra fields in your response — only the JSON object.`;
// Prompt WHEN exact label basis is present (macrosPerReferencePortion)
const SYSTEM_PROMPT_WITH_LABEL = `You are a precision nutrition calculator AI. Your task is to take a list of food components and an exact nutrition label basis, then accurately calculate the total nutritional values of all components combined.

### JSON Output Structure
You MUST return a JSON object with this exact structure:
{
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer"
}

### You Will Receive
1) "foodComponents": an array of items:
   { "name": "string", "amount": number, "unit": "string" }

2) "macrosPerReferencePortion": exact label data:
   {
     "referencePortionAmount": "string",            // e.g., "40 g", "100 ml", "8 oz" (number + unit)
     "caloriesForReferencePortion": integer,
     "proteinForReferencePortion": integer,
     "carbsForReferencePortion": integer,
     "fatForReferencePortion": integer
   }

### CRITICAL INSTRUCTIONS:

**USE THE LABEL BASIS FOR SCALING WHERE APPLICABLE (PREFERRED):**
- Parse "referencePortionAmount" as "<number> <unit>" (units like g or ml).
- Compute per-unit macros by dividing label macros by the numeric quantity.
  Example: "40 g" and 190 kcal → per-gram kcal ≈ 190/40.
- For any component amounts using a compatible unit with the label basis (e.g., grams with grams or milliliters with milliliters), scale linearly from the per-unit macros.
- If multiple components correspond to the same packaged item, scale each by its own amount and sum.
- Components that are unrelated to the labeled item or use incompatible units should be estimated using general nutrition knowledge. Sum everything.

**ALWAYS CALCULATE TOTALS:** Your primary task is to calculate totals ("calories", "protein", "carbs", "fat") as integers. Keep kcal roughly consistent with macros (kcal ≈ 4*protein + 4*carbs + 9*fat; small deviation acceptable).

Do not include any explanation or extra fields in your response — only the JSON object.`;
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
    // Accept optional macrosPerReferencePortion; decide prompt BEFORE calling the model
    const { foodComponents, macrosPerReferencePortion } = await req.json();
    if (!foodComponents) {
      return new Response(
        JSON.stringify({
          error: "foodComponents is required.",
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
    // Decide which system prompt & payload to use, based on presence of macrosPerReferencePortion
    const hasLabel =
      macrosPerReferencePortion &&
      typeof macrosPerReferencePortion === "object" &&
      typeof macrosPerReferencePortion.referencePortionAmount === "string" &&
      macrosPerReferencePortion.referencePortionAmount.trim() !== "";
    const systemPrompt = hasLabel
      ? SYSTEM_PROMPT_WITH_LABEL
      : SYSTEM_PROMPT_BASE;
    // Build user content accordingly
    const payload = hasLabel
      ? {
          foodComponents,
          macrosPerReferencePortion,
        }
      : {
          foodComponents,
        };
    const userPrompt = hasLabel
      ? "Use the exact label basis to scale compatible components precisely. Then add estimates for any remaining items. Input: " +
        JSON.stringify(payload)
      : "Calculate the total nutrition using general nutrition knowledge for these components: " +
        JSON.stringify(payload);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
    const result = {
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
    console.error("Error in nutrition refinement:", error);
    return new Response(JSON.stringify(ERROR_RESPONSE), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

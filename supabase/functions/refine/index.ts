// functions/refine-nutrition/index.ts (renamed for clarity)
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
const SYSTEM_PROMPT = `You are a precision nutrition calculator AI. Your task is to take a list of food components and accurately calculate the total nutritional values of all components combined.

### JSON Output Structure
You MUST return a JSON object with this exact structure:
{
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer",
}

### CRITICAL INSTRUCTIONS:

**CALCULATE NUTRITION:** Your primary task is to calculate the total macros of all components combined (\`calories\`, \`protein\`, \`carbs\`, \`fat\`). Even if the inputs seem unrealistic to you still calculate the totals.
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
    const { foodComponents } = await req.json();
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
    const userPrompt = `Calculate the total nutrition values for the following ingredients: ${JSON.stringify(
      foodComponents
    )}`;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      temperature: 0.2,
    });
    const messageContent = chatCompletion.choices[0].message.content;
    if (!messageContent) {
      throw new Error("AI returned an empty message.");
    }
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

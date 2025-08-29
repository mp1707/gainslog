// Text-based nutrition estimation using OpenAI (New API Key System)
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
// The detailed system prompt for nutrition estimation
const SYSTEM_PROMPT = `You are a meticulous nutrition expert. Your primary task is to analyze a user's description of a meal and return a single, valid JSON object with your nutritional estimation.

### JSON Output Structure
You MUST return a JSON object with this exact structure:
{
  "generatedTitle": "string",
  "estimationConfidence": "integer",
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer"
}

### Detailed Instructions for Each Field

1.  **generatedTitle (string):**
    * Create a short, descriptive title for the meal from the user's input.
    * Example: If the input is "40g haferflocken mit 20g nüssen und 500g magerquark", a good title is "Oats with Nuts and Quark".

2.  **estimationConfidence (integer, 1-100):**
    * This is the most critical field. Your confidence level MUST be based on the **specificity** of the user's input.
    * **High Confidence (90-100):** Use this range when the user provides **specific ingredients with precise weights or volumes** (e.g., "40g oats", "500g low-fat quark", "150g chicken breast"). In this case, act as a calculator using known nutritional data.
    * **Medium Confidence (50-89):** Use this range when the user provides **specific ingredients but no quantities** (e.g., "oats with nuts and quark", "chicken breast with rice"). You must assume standard portion sizes (e.g., 50g oats, 150g chicken, 80g uncooked rice), but reflect this assumption with a lower confidence score.
    * **Low Confidence (1-49):** Use this range when the input is **vague, generic, or has wide variations** (e.g., "a bowl of cereal", "a sandwich", "pasta with sauce"). Your estimation will be a rough guess based on broad averages. The more vague the input, the lower the confidence score.

3.  **calories, protein, carbs, fat (all integers):**
    * Estimate these values for the **ENTIRE** meal described.
    * The accuracy of your estimation should directly correlate with the \`estimationConfidence\`.
    * For high-confidence inputs, calculate the total by summing the macros for each specified ingredient.
    * For low/medium-confidence inputs, base your estimate on typical recipes and standard portion sizes.
    * All values must be non-negative integers.

### Example Scenarios

#### High Confidence Example:
* **User Input:** \`Food: 40g haferflocken mit 20g nüssen und 500g magerquark.\`
* **Your Internal Reasoning:** The user is very specific. I can calculate this accurately. 40g oats (~150 kcal), 20g mixed nuts (~130 kcal), 500g low-fat quark (~330 kcal). Total calories ~610. Protein is high due to quark.
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "Oats with Nuts and Quark",
      "estimationConfidence": 95,
      "calories": 610,
      "protein": 75,
      "carbs": 40,
      "fat": 18
    }
    \`\`\`

#### Low Confidence Example:
* **User Input:** \`Food: Müsli mit Quark\`
* **Your Internal Reasoning:** This is vague. What kind of Müsli? How much? What kind of Quark (low-fat, full-fat)? How much? I must assume standard portions: maybe 60g of a standard fruit muesli and 250g of 20% fat quark. My confidence is low because these are significant assumptions.
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "Muesli with Quark",
      "estimationConfidence": 35,
      "calories": 450,
      "protein": 25,
      "carbs": 55,
      "fat": 15
    }
    \`\`\`
`;
// Initialize the OpenAI client
const openai = new OpenAI();
// Simple API key validation function
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  // Check for either Bearer token or apikey header
  if (authHeader?.startsWith("Bearer ") || apiKeyHeader) {
    return true; // Basic validation - in production, you'd validate against actual keys
  }
  return false;
}
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  // Ensure the request method is POST
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
  // Validate API key (simple check for new API key system)
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

    // Construct the user prompt
    const userPrompt = `Food: ${description}. Estimate nutrition for the whole food.`;
    // Fetch the completion from OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-5",
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
    // Parse the JSON content from the AI
    const nutrition = JSON.parse(messageContent);
    // Sanitize and structure the final result
    const result = {
      generatedTitle: nutrition.generatedTitle || "AI estimate",
      estimationConfidence: Math.max(
        1,
        Math.min(100, Math.round(nutrition.estimationConfidence || 10))
      ),
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
    console.error("Error:", error);
    // Determine the error type for a more specific response
    const errorMessage =
      error instanceof SyntaxError
        ? "AI returned invalid JSON"
        : "Internal server error";
    const statusCode = error instanceof SyntaxError ? 502 : 500;
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message,
      }),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

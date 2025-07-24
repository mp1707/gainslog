// deno-lint-ignore-file
// @ts-nocheck

// Image-based nutrition estimation using OpenAI Vision API (New API Key System)
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";

// Fallback response for non-food images or API failures
const INVALID_IMAGE_RESPONSE = {
  generatedTitle: "Invalid Image",
  estimationConfidence: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

// Enhanced system prompt for image analysis
const SYSTEM_PROMPT = `You are a meticulous nutrition expert specializing in food image analysis. Your primary task is to analyze a food image and return a single, valid JSON object with your nutritional estimation.

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
    * Create a short, descriptive title for the meal from what you see in the image.
    * Focus on the main food items visible (e.g., "Grilled Chicken with Rice and Vegetables", "Oatmeal with Berries and Nuts").
    * If additional title/description context is provided, incorporate it but prioritize what's visible in the image.

2.  **estimationConfidence (integer, 1-100):**
    * Base your confidence on **visual clarity and portion size estimation accuracy**.
    * **High Confidence (80-100):** Use when the image shows food clearly, portions are easily estimable, and food items are identifiable (e.g., clear photo of a measured meal, recognizable portions).
    * **Medium Confidence (50-79):** Use when food is visible but portions are harder to estimate, or some items are partially obscured (e.g., food in a bowl where you can't see the full portion, mixed dishes).
    * **Low Confidence (1-49):** Use when the image is unclear, portions are very difficult to estimate, or food items are hard to identify (e.g., blurry photos, complex mixed dishes, unusual angles).

3.  **calories, protein, carbs, fat (all integers):**
    * Estimate these values for the **ENTIRE** meal visible in the image.
    * Base your estimates on typical portion sizes for the foods you can identify.
    * Consider cooking methods visible in the image (fried, grilled, steamed, etc.).
    * All values must be non-negative integers.
    * If you can see multiple portions or servings, estimate for the total amount visible.

### Image Analysis Guidelines

* **Portion Size Estimation:** Use visual cues like plate size, utensils, or common reference objects to estimate portions.
* **Food Identification:** Identify specific foods, cooking methods, and ingredients visible.
* **Context Integration:** If title/description is provided, use it to clarify ambiguous items in the image, but prioritize visual evidence.
* **Conservative Estimation:** When in doubt about portions, err on the side of reasonable typical serving sizes.

### Example 

#### Non-Food Image Example:
* **Image Content:** Photo of a cat
* **Your Internal Reasoning:** This is not a food image. I can't estimate the nutritional content of a cat. Always return the Invalid Image response immediately. Also the confidence should be 0.
* **Required Response:**
    \`\`\`json
    {
      "generatedTitle": "Invalid Image",
      "estimationConfidence": 0,
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
    \`\`\`

#### High Confidence Example:
* **Image Content:** Clear photo of a plated meal with distinct portions - 150g grilled chicken breast, 1 cup of white rice, mixed vegetables
* **Additional Context:** "Lunch - grilled chicken with rice"
* **Your Internal Reasoning:** Image is clear, portions are estimable, cooking method is visible. The context confirms what I see.
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "Grilled Chicken with Rice and Vegetables",
      "estimationConfidence": 85,
      "calories": 520,
      "protein": 45,
      "carbs": 55,
      "fat": 8
    }
    \`\`\`

#### Medium Confidence Example:
* **Image Content:** Bowl of mixed stir-fry with vegetables and meat, portions partially obscured
* **Additional Context:** "Dinner - beef stir fry"
* **Your Internal Reasoning:** I can see it's a stir-fry with beef and vegetables, but the exact portion size is harder to determine from the bowl angle. The context helps identify the meat type.
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "Beef Stir-Fry with Vegetables",
      "estimationConfidence": 65,
      "calories": 380,
      "protein": 28,
      "carbs": 25,
      "fat": 18
    }
    \`\`\`

#### Low Confidence Example:
* **Image Content:** Blurry photo of what appears to be a sandwich, hard to identify specific ingredients
* **Additional Context:** "Quick lunch"
* **Your Internal Reasoning:** The image quality makes it difficult to identify specific ingredients or estimate the size accurately. This will be a very rough estimate.
* **Expected JSON Output:**
    \`\`\`json
    {
      "generatedTitle": "Sandwich",
      "estimationConfidence": 30,
      "calories": 350,
      "protein": 15,
      "carbs": 40,
      "fat": 12
    }
    \`\`\`

    REMEMBER: Always check if the image contains food FIRST. If not, return the Invalid Image response immediately.
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
    const { imageUrl, title, description } = await req.json();
    // Validate input
    if (!imageUrl?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Image URL is required",
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
    // Construct the user prompt with optional context
    let userPrompt =
      "Analyze this food image and estimate its nutritional content.";
    if (title?.trim() || description?.trim()) {
      userPrompt += " Additional context:";
      if (title?.trim()) userPrompt += ` Title: ${title.trim()}.`;
      if (description?.trim())
        userPrompt += ` Description: ${description.trim()}.`;
    }
    // Create the messages array with the image
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
    // Fetch the completion from OpenAI Vision API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: {
        type: "json_object",
      },
      temperature: 0.2,
      max_tokens: 1000,
    });
    const messageContent = chatCompletion.choices[0].message.content;
    if (!messageContent) {
      throw new Error("AI returned an empty message.");
    }
    // Parse the JSON content from the AI
    const nutrition = JSON.parse(messageContent);
    // Sanitize and structure the final result
    const result = {
      generatedTitle: nutrition.generatedTitle || `Food Image Analysis`,
      estimationConfidence: Math.max(
        1,
        Math.min(100, Math.round(nutrition.estimationConfidence || 0))
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

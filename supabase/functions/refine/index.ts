// deno-lint-ignore-file
// @ts-nocheck
// Unified NUTRITION REFINEMENT (DE/EN) using OpenAI Responses + Zod Structured Outputs
import OpenAI from "jsr:@openai/openai@6.5.0";
import { z } from "npm:zod@3.25.1";
import { zodTextFormat } from "jsr:@openai/openai@6.5.0/helpers/zod";
import { Ratelimit } from "npm:@upstash/ratelimit@2.0.7";
import { Redis } from "npm:@upstash/redis@1.35.6";
// Rate limiting
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
// Helper: get client IP (behind proxy)
function getClientIp(req) {
  const ipHeader = req.headers.get("x-forwarded-for");
  return ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
}
// Locale bundles (strings + prompts)
const LOCALE = {
  en: {
    errorTitle: "Refinement Error",
    // Base prompt (NO label basis)
    systemPromptBase: `You are a precision nutrition calculator AI. Your task is to take a list of food components and accurately calculate the total nutritional values of all components combined.

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

Do not include any explanation or extra fields in your response — only the JSON object.`,
    // Label-based prompt (macrosPerReferencePortion present)
    systemPromptWithLabel: `You are a precision nutrition calculator AI. Your task is to take a list of food components and an exact nutrition label basis, then accurately calculate the total nutritional values of all components combined.

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
     "referencePortionAmount": "string",            // e.g., "40 g", "100 ml" (number + unit)
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

Do not include any explanation or extra fields in your response — only the JSON object.`,
    // User prompt builders
    buildUserPromptBase: (
      payload
    ) => `Calculate the total nutrition using general nutrition knowledge for these components.

Input (JSON):
${JSON.stringify(payload)}`,
    buildUserPromptWithLabel: (
      payload
    ) => `Use the exact label basis to scale compatible components precisely. Then add estimates for any remaining items.

Input (JSON):
${JSON.stringify(payload)}`,
  },
  de: {
    errorTitle: "Verfeinerungsfehler",
    // Basis-Prompt (ohne Etikettbasis)
    systemPromptBase: `Du bist eine präzise Ernährungsrechner-KI. Deine Aufgabe besteht darin, eine Liste von Lebensmittelkomponenten zu übernehmen und die gesamten Nährwerte aller Komponenten zusammen exakt zu berechnen.

### JSON-Ausgabestruktur
Du MUSST ein JSON-Objekt in exakt dieser Struktur zurückgeben:
{
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer"
}

### KRITISCHE ANWEISUNGEN:

**NÄHRWERTE BERECHNEN:** Deine Hauptaufgabe ist, die Gesamtsummen der Makros aller Komponenten zu berechnen ("calories", "protein", "carbs", "fat"). Auch wenn Eingaben unrealistisch wirken, berechne die Summen trotzdem.

**METHODE:** Schätze die Makros pro Komponente mithilfe allgemeiner Ernährungskenntnisse (typische Werte für die genannten Lebensmittel und Einheiten) und summiere sie. Gib Ganzzahlen zurück. Halte kcal grob konsistent mit den Makros (kcal ≈ 4*protein + 4*carbs + 9*fat; geringe Abweichung ist akzeptabel).

Liefere keinerlei Erklärungen oder zusätzliche Felder — nur das JSON-Objekt.`,
    // Prompt mit exakter Etikettbasis
    systemPromptWithLabel: `Du bist eine präzise Ernährungsrechner-KI. Deine Aufgabe besteht darin, eine Liste von Lebensmittelkomponenten sowie eine exakte Nährwert-Etikettbasis zu verwenden und die gesamten Nährwerte aller Komponenten zusammen exakt zu berechnen.

### JSON-Ausgabestruktur
Du MUSST ein JSON-Objekt in exakt dieser Struktur zurückgeben:
{
  "calories": "integer",
  "protein": "integer",
  "carbs": "integer",
  "fat": "integer"
}

### Du erhältst
1) "foodComponents": ein Array von Einträgen:
   { "name": "string", "amount": number, "unit": "string" }

2) "macrosPerReferencePortion": exakte Etikett-Daten:
   {
     "referencePortionAmount": "string",            // z. B. "40 g", "100 ml" (Zahl + Einheit)
     "caloriesForReferencePortion": integer,
     "proteinForReferencePortion": integer,
     "carbsForReferencePortion": integer,
     "fatForReferencePortion": integer
   }

### KRITISCHE ANWEISUNGEN:

**ETIKETTBASIS ZUR SKALIERUNG NUTZEN (BEVORZUGT):**
- Interpretiere "referencePortionAmount" als "<Zahl> <Einheit>" (Einheiten wie g oder ml).
- Berechne pro-Einheit-Makros, indem du die Etikett-Makros durch die Zahl teilst.
  Beispiel: "40 g" und 190 kcal → kcal pro Gramm ≈ 190/40.
- Für Komponenten mit kompatibler Einheit zur Etikettbasis (z. B. Gramm mit Gramm oder Milliliter mit Milliliter), skaliere linear anhand der pro-Einheit-Makros.
- Wenn mehrere Komponenten zum gleichen verpackten Produkt gehören, skaliere jede nach ihrer eigenen Menge und summiere.
- Komponenten, die nicht zur Etikettbasis passen oder inkompatible Einheiten haben, werden mithilfe allgemeiner Ernährungskenntnisse geschätzt. Summe alles auf.

**GESAMTSUMMEN IMMER BERECHNEN:** Deine Hauptaufgabe ist, die Totals ("calories", "protein", "carbs", "fat") als Ganzzahlen zu liefern. Halte kcal grob konsistent mit den Makros (kcal ≈ 4*protein + 4*carbs + 9*fat; geringe Abweichung akzeptabel).

Liefere keinerlei Erklärungen oder zusätzliche Felder — nur das JSON-Objekt.`,
    // User prompt builders
    buildUserPromptBase: (
      payload
    ) => `Berechne die Gesamtnährwerte mithilfe allgemeiner Ernährungskenntnisse für diese Komponenten.

Eingabe (JSON):
${JSON.stringify(payload)}`,
    buildUserPromptWithLabel: (
      payload
    ) => `Nutze die exakte Etikettbasis, um kompatible Komponenten präzise zu skalieren. Ergänze anschließend Schätzungen für verbleibende Positionen.

Eingabe (JSON):
${JSON.stringify(payload)}`,
  },
};
// OpenAI client
const openai = new OpenAI();
// ---------- Zod schema for Structured Outputs (all fields required) ----------
const NutritionTotals = z.object({
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
});
// Simple API key validation
function validateApiKey(request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("apikey");
  return !!(authHeader?.startsWith("Bearer ") || apiKeyHeader);
}
// Build locale-specific user prompt (single template per branch)
function buildUserPrompt(lang, hasLabel, payload) {
  const L = LOCALE[lang];
  return hasLabel
    ? L.buildUserPromptWithLabel(payload)
    : L.buildUserPromptBase(payload);
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
    // Accept optional macrosPerReferencePortion; choose prompt BEFORE calling the model
    const { foodComponents, macrosPerReferencePortion, language } =
      await req.json();
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
    // Locale selection (fallback to EN)
    let lang = "en";
    if (
      typeof language === "string" &&
      language.trim().toLowerCase() === "de"
    ) {
      lang = "de";
    }
    const L = LOCALE[lang];
    // Decide which system prompt & payload to use, based on presence of macrosPerReferencePortion
    const hasLabel =
      macrosPerReferencePortion &&
      typeof macrosPerReferencePortion === "object" &&
      typeof macrosPerReferencePortion.referencePortionAmount === "string" &&
      macrosPerReferencePortion.referencePortionAmount.trim() !== "";
    const systemPrompt = hasLabel
      ? L.systemPromptWithLabel
      : L.systemPromptBase;
    const payload = hasLabel
      ? {
          foodComponents,
          macrosPerReferencePortion,
        }
      : {
          foodComponents,
        };
    // Build locale-specific user prompt (single, readable template)
    const userPrompt = buildUserPrompt(lang, hasLabel, payload);
    // ▶️ Responses API + Zod Structured Outputs
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: systemPrompt,
      reasoning: {
        effort: "minimal",
      },
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
        format: zodTextFormat(NutritionTotals, "nutrition_totals"),
      },
      top_p: 1,
    });
    // Prefer SDK-parsed output; fallback to raw JSON if needed
    const totals =
      response.output_parsed ?? JSON.parse(response.output_text || "{}");
    const result = {
      calories: Math.max(0, Math.round(totals.calories || 0)),
      protein: Math.max(0, Math.round(totals.protein || 0)),
      carbs: Math.max(0, Math.round(totals.carbs || 0)),
      fat: Math.max(0, Math.round(totals.fat || 0)),
    };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in unified nutrition refinement:", error);
    // Localize fallback error object using the request body (if available)
    let L = LOCALE.en;
    try {
      const clone = req.clone();
      const body = await clone.json();
      if (
        typeof body?.language === "string" &&
        body.language.trim().toLowerCase() === "de"
      ) {
        L = LOCALE.de;
      }
    } catch {
      // ignore parse errors
    }
    const ERROR_RESPONSE = {
      generatedTitle: L.errorTitle,
      foodComponents: [],
      estimationConfidence: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    return new Response(JSON.stringify(ERROR_RESPONSE), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

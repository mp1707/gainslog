// deno-lint-ignore-file
// @ts-nocheck
// Unified TEXT-based nutrition estimation (DE/EN) using OpenAI Responses + Zod Structured Outputs
import OpenAI from "jsr:@openai/openai@6.5.0";
import { z } from "npm:zod@3.25.1";
import { zodTextFormat } from "jsr:@openai/openai@6.5.0/helpers/zod";
import { Ratelimit } from "npm:@upstash/ratelimit@2.0.7";
import { Redis } from "npm:@upstash/redis@1.35.6";
// Rate limiting (text variant uses a more generous window)
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
    errorTitle: "Estimation Error",
    defaultGeneratedTitle: "AI Estimate",
    pieceCanonical: "piece",
    systemPrompt: `You are a meticulous nutrition expert. Analyze a user's text description of a meal and return ONE valid JSON object with your nutritional estimation. Decompose the meal into components.

STRICT OUTPUT RULES
- Return ONLY one JSON object (no prose, no markdown, no trailing text).
- Use EXACTLY the schema below (no extra keys, no nulls EXCEPT where noted).
- All numbers must be integers. Round half up.
- Units must be lowercase and singular.
- Totals (calories, protein, carbs, fat) must be the sum of components and roughly consistent with kcal ≈ 4p + 4c + 9f.

JSON OUTPUT SCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": number,
      "unit": "string",
      // REQUIRED but set to null unless unit is "piece":
      // "recommendedMeasurement": { "amount": number, "unit": "string" } | null
    }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer
}

VALID UNITS (unit field)
"g", "ml", "piece"

UNIT & SYNONYM NORMALIZATION
- Normalize plurals and synonyms:
  * "grams" → "g"
  * "milliliters", "millilitres" → "ml"
  * "pcs", "pieces", "slice", "slices" → "piece"
- Prefer exact measurable units ("g" or "ml").
- Use the ambiguous unit "piece" only when it is the clearest description (e.g., whole apple, burger).
- REQUIRED NULLABILITY: If unit is NOT "piece", set "recommendedMeasurement": null. If unit IS "piece", include a realistic recommended measurement (prefer "g" or "ml").

CORE LOGIC
1) Deconstruct the description into distinct, specific components. Avoid vague catch-alls when detail is implied (e.g., choose "tomato sauce" over "sauce" if context suggests it).
2) Amount handling (CRITICAL):
   - Honor explicit amounts and units from the user.
   - When the user provides a count of items ("2 bananas"), convert to { amount: 2, unit: "piece" } and include a best-fit recommendedMeasurement in grams.
   - If quantities are missing, estimate a sensible single-serving amount and choose "g" or "ml" when possible. Only fall back to "piece" when no better measurable unit fits.
3) Title formatting:
   - generatedTitle starts with ONE fitting emoji followed by 1–3 concise words. No ending punctuation. Example: "🥗 Chicken Bowl".
4) Macros:
   - Provide realistic integers for calories, protein, carbs, and fat across the entire meal.
   - Keep calories roughly consistent with macros via 4/4/9 rule, but prioritize the best domain knowledge estimate when conflicts arise.
   - Respect extreme quantities literally ("100 pancakes" → very high totals).

EXAMPLES
- Keep examples consistent with the above rules, and ensure outputs strictly follow the JSON schema.`,
  },
  de: {
    errorTitle: "Schätzungsfehler",
    defaultGeneratedTitle: "KI-Schätzung",
    pieceCanonical: "stück",
    systemPrompt: `Du bist eine akribische Ernährungsexpertin. Analysiere die Textbeschreibung einer Mahlzeit und gib GENAU EIN gültiges JSON-Objekt mit deiner Nährwertschätzung zurück. Zerlege die Mahlzeit in Komponenten.

STRIKTE AUSGABEREGELN
- Gib NUR ein JSON-Objekt zurück (keine Prosa, kein Markdown, kein nachfolgender Text).
- Verwende EXAKT das untenstehende Schema (keine zusätzlichen Schlüssel, keine Null-Werte AUSSER wo angegeben).
- Alle Zahlen müssen Ganzzahlen sein. Kaufmännisch runden (0,5 aufrunden).
- Einheiten müssen kleingeschrieben und im Singular sein.
- Summen (calories, protein, carbs, fat) müssen die Summe der Komponenten sein und grob mit kcal ≈ 4p + 4c + 9f konsistent bleiben.

DEUTSCHLAND-PRIORITÄT
- Bevorzuge Zutaten, Produkte und Gerichte, die in Deutschland üblich/verfügbar sind, und nutze, wo möglich, EU-/DE-typische Portions- und Nährwertbezüge. Vermeide US-spezifische Produkte, die hier typischerweise nicht erhältlich sind.

JSON-AUSGABESCHEMA
{
  "generatedTitle": "string",
  "foodComponents": [
    {
      "name": "string",
      "amount": number,
      "unit": "string",
      // ERFORDERLICH, aber auf null setzen außer wenn unit "stück" ist:
      // "recommendedMeasurement": { "amount": number, "unit": "string" } | null
    }
  ],
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer
}

GÜLTIGE EINHEITEN (Feld unit)
"g", "ml", "stück"

EINHEITS- & SYNONYMNORMALISIERUNG
- Plurale und Synonyme normalisieren:
  * "grams" → "g"
  * "milliliters", "millilitres" → "ml"
  * "pcs", "pieces", "slice", "slices" → "stück"
  * "scheibe", "scheiben", "stück", "stücke", "stk", "st." → "stück"
- Bevorzuge exakt messbare Einheiten ("g" oder "ml").
- Verwende die uneindeutige Einheit "stück" nur, wenn sie die klarste Beschreibung ist (z. B. ganzer Apfel, Burger).
- ERFORDERLICHE NULLBARKEIT: Wenn unit NICHT "stück" ist, setze "recommendedMeasurement": null. Wenn unit "stück" IST, füge eine realistische empfohlene Messung hinzu (bevorzuge "g" oder "ml").

KERNLOGIK
1) Zerlege die Beschreibung in eindeutige, spezifische Komponenten. Vermeide vage Sammelbezeichnungen, wenn Details impliziert werden (z. B. "Tomatensauce" statt "Sauce", falls Kontext dies nahelegt).
2) Mengenumgang (KRITISCH):
   - Respektiere explizite Mengen und Einheiten des Nutzers.
   - Wenn der Nutzer eine Anzahl von Gegenständen angibt ("2 Bananen"), konvertiere zu { amount: 2, unit: "stück" } und füge eine realistische empfohlene Messung in Gramm hinzu.
   - Falls Mengen fehlen, schätze eine sinnvolle Einzelportion und wähle nach Möglichkeit "g" oder "ml". Greife nur auf "stück" zurück, wenn keine bessere messbare Einheit passt.
3) Titel-Formatierung:
   - generatedTitle beginnt mit EINEM passenden Emoji, gefolgt von 1–3 knappen Wörtern. Kein Punkt am Ende. Beispiel: "🥗 Chicken Bowl".
4) Makros:
   - Gib realistische Ganzzahlen für calories, protein, carbs und fat für die gesamte Mahlzeit an.
   - Halte die Kalorien grob konsistent mit der 4/4/9-Regel, aber priorisiere die beste fachliche Schätzung, wenn es Widersprüche gibt.
   - Respektiere extreme Mengen wörtlich ("100 Pfannkuchen" → sehr hohe Summen).

BEISPIELE
- Halte Beispiele konsistent zu den Regeln und stelle sicher, dass die Ausgaben strikt dem JSON-Schema entsprechen.`,
  },
};
// OpenAI client
const openai = new OpenAI();
// ---------- Zod schema (use a superset for units; we canonicalize later) ----------
const RecommendedMeasurement = z.object({
  amount: z.number().int().nonnegative(),
  unit: z.enum(["g", "ml"]),
});
const FoodComponent = z.object({
  name: z.string(),
  amount: z.number().int().nonnegative(),
  unit: z.enum(["g", "ml", "piece", "stück"]),
  // REQUIRED by schema but nullable in model output; we keep it optional in the final sanitized payload
  recommendedMeasurement: RecommendedMeasurement.nullable(),
});
const NutritionEstimation = z.object({
  generatedTitle: z.string(),
  foodComponents: z.array(FoodComponent),
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
// Normalize arbitrary unit strings into canonical per-locale units
function normalizeUnit(raw, locale) {
  const u = (raw || "").trim().toLowerCase();
  // grams
  if (u === "g" || u === "gram" || u === "grams") return "g";
  // milliliters
  if (
    u === "ml" ||
    u === "milliliter" ||
    u === "milliliters" ||
    u === "millilitre" ||
    u === "millilitres"
  )
    return "ml";
  // handle piece synonyms (both languages)
  const pieceSynonyms = new Set([
    "piece",
    "pieces",
    "pc",
    "pcs",
    "slice",
    "slices",
    "stück",
    "stücke",
    "stk",
    "st.",
    "st",
    "scheibe",
    "scheiben",
    "stueck",
    "stuck",
  ]);
  if (pieceSynonyms.has(u)) return locale.pieceCanonical;
  // fall back to canonical piece for the selected locale
  return locale.pieceCanonical;
}
// Build locale-specific user prompt (single template per locale)
function buildUserPrompt(lang, description) {
  const d =
    (description && description.trim()) ||
    (lang === "de" ? "(keine Beschreibung)" : "(no description)");
  if (lang === "de") {
    return `Schätze die Nährwerte für folgende Mahlzeit.
- Wenn du für eine Komponente "stück" verwendest, füge ZUSÄTZLICH "recommendedMeasurement" mit einer realistischen exakten Menge und Einheit hinzu (bevorzuge g oder ml).
- Wenn Mengen fehlen, schätze sinnvolle Einzelportionen und bevorzuge g/ml.

Beschreibung:
${d}`;
  }
  // EN default
  return `Estimate the nutrition for the following meal.
- If you use "piece" for any component, ALSO include "recommendedMeasurement" with a realistic exact amount and unit (prefer g or ml).
- If quantities are missing, estimate sensible single-serving amounts and prefer g/ml.

Description:
${d}`;
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
    const { description, language } = await req.json();
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
    // Locale selection (fallback to EN)
    let lang = "en";
    let L = LOCALE.en;
    if (
      typeof language === "string" &&
      language.trim().toLowerCase() === "de"
    ) {
      lang = "de";
      L = LOCALE.de;
    }
    // Build locale-specific user prompt (single, readable template)
    const userPrompt = buildUserPrompt(lang, description);
    // ▶️ Responses API + Zod Structured Outputs
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: L.systemPrompt,
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
        format: zodTextFormat(NutritionEstimation, "nutrition_estimate"),
      },
      top_p: 1,
    });
    // Prefer SDK-parsed output; fallback to raw JSON if needed
    const nutrition =
      response.output_parsed ?? JSON.parse(response.output_text || "{}");
    // Sanitize and structure the final result
    const allowedUnits = ["g", "ml", "piece", "stück"];
    const exactUnits = ["g", "ml"];
    const foodComponents = Array.isArray(nutrition.foodComponents)
      ? nutrition.foodComponents
          .map((comp) => {
            const baseUnit = normalizeUnit(String(comp.unit || ""), L);
            const base = {
              name: String(comp.name || "Unknown Item"),
              amount: Math.max(0, Number(comp.amount) || 0),
              unit: allowedUnits.includes(baseUnit)
                ? baseUnit
                : L.pieceCanonical,
            };
            // Only pass through recommendedMeasurement if unit is piece-like
            const isPieceLike = base.unit === "piece" || base.unit === "stück";
            if (
              isPieceLike &&
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
              if (rmAmount > 0 && exactUnits.includes(rmUnit)) {
                base.recommendedMeasurement = {
                  amount: rmAmount,
                  unit: rmUnit,
                };
              }
            }
            return base;
          })
          .filter((c) => c.name && c.name !== "Unknown Item")
      : [];
    const result = {
      generatedTitle: nutrition.generatedTitle || L.defaultGeneratedTitle,
      foodComponents,
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
    console.error("Error in unified text-based estimation:", error);
    // Try to localize the fallback error title using the request body (if available)
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
    } catch (_) {
      // ignore parse errors
    }
    const ERROR_RESPONSE = {
      generatedTitle: L.errorTitle,
      foodComponents: [],
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

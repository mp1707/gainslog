// deno-lint-ignore-file
// @ts-nocheck
// Audio transcription using OpenAI Whisper API
import { OpenAI } from "https://deno.land/x/openai@v4.52.7/mod.ts";
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
Deno.serve(async (req)=>{
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  // Ensure the request method is POST
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
  // Validate API key
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
    // Parse the FormData from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    if (!audioFile) {
      return new Response(JSON.stringify({
        error: "No audio file provided"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Call OpenAI Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });
    // Check if transcription is empty or failed
    const transcriptionText = transcription?.trim();
    if (!transcriptionText) {
      return new Response(JSON.stringify({
        transcription: "Something went wrong"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Return the transcription result
    return new Response(JSON.stringify({
      transcription: transcriptionText
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Transcription error:", error);
    // Always return a fallback transcription as per requirements
    return new Response(JSON.stringify({
      transcription: "Something went wrong"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

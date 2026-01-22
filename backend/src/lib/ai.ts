import { google } from "@ai-sdk/google";
import { cerebras } from "@ai-sdk/cerebras";
import { generateObject as aiGenerateObject } from "ai";
import { MODEL_LITE, MODEL } from "./constants";
import logger from "./logger";

const PROVIDERS = [
  {
    name: "gemini",
    model: google(MODEL),
    lite: google(MODEL_LITE),
  },
  {
    name: "cerebras",
    model: cerebras("llama-3.3-70b"),
  },
];

export const AI_SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

export const AI_PROVIDER_OPTIONS = {
  google: {
    structuredOutputs: true,
    safetySettings: AI_SAFETY_SETTINGS,
  },
};

export const modelLite = google(MODEL_LITE);
export const modelFlash = google(MODEL);

type GenerateOptions<T> = {
  schema: z.Schema<T>;
  prompt: string;
  system?: string;
  temperature?: number;
  topP?: number;
  providerOptions?: Record<string, unknown>;
  lite?: boolean;
};

export async function generateObject<T>(opts: GenerateOptions<T>) {
  const errors: Error[] = [];

  for (const provider of PROVIDERS) {
    const model = opts.lite && provider.lite ? provider.lite : provider.model;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-deprecated
      const result = await (aiGenerateObject as any)({
        model,
        schema: opts.schema,
        prompt: opts.prompt,
        system: opts.system,
        temperature: opts.temperature,
        topP: opts.topP,
        providerOptions: opts.providerOptions,
      });

      if (errors.length > 0) {
        logger.info(
          `[AI] ${provider.name} succeeded after ${errors.length} fallback(s)`,
        );
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errors.push(error);
      logger.warn(`[AI] ${provider.name} failed: ${error.message}`);
    }
  }

  throw new AggregateError(errors, "All AI providers failed");
}

export function handleAiError(
  error: unknown,
  context: string,
): { status: number; body: { error: string } } {
  logger.error(`AI ${context} error:`, error);

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = JSON.stringify(error);

  if (
    errorString.includes("PROHIBITED_CONTENT") ||
    errorString.includes("blockReason")
  ) {
    return {
      status: 400,
      body: {
        error:
          "Content cannot be processed. Please ensure it contains appropriate language.",
      },
    };
  }

  if (
    errorString.includes("RESOURCE_EXHAUSTED") ||
    errorString.includes("429") ||
    errorMessage.includes("Resource exhausted") ||
    errorMessage.includes("rate") ||
    errorMessage.includes("quota")
  ) {
    return {
      status: 503,
      body: {
        error:
          "AI service is temporarily busy. Please try again in a few minutes.",
      },
    };
  }

  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("TimeoutError")
  ) {
    return {
      status: 504,
      body: {
        error:
          "The AI service is taking too long. Please try again in a moment.",
      },
    };
  }

  return {
    status: 500,
    body: { error: `Failed to ${context}. Please try again.` },
  };
}

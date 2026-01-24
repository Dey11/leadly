import { z } from "zod";
import { google } from "@ai-sdk/google";
import { cerebras } from "@ai-sdk/cerebras";
import { generateObject, type LanguageModel } from "ai";
import { MODEL_LITE, MODEL } from "./constants";
import logger from "./logger";
import { createOpenAI } from "@ai-sdk/openai";

const nebius = createOpenAI({
  baseURL: "https://api.tokenfactory.nebius.com/v1",
  apiKey: process.env.NEBIUS_API_KEY,
});

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

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  let errorString = "";
  try {
    errorString = JSON.stringify(error).toLowerCase();
  } catch {
    errorString = "circular_error";
  }

  return (
    message.includes("rate") ||
    message.includes("quota") ||
    message.includes("resource exhausted") ||
    message.includes("too many requests") ||
    message.includes("timeout") ||
    errorString.includes("429") ||
    errorString.includes("resource_exhausted")
  );
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  providerName: string,
): Promise<T> {
  let lastError: Error | undefined;
  let delay = RETRY_CONFIG.initialDelayMs;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries) {
        throw lastError;
      }

      logger.warn(
        `[AI] ${providerName} attempt ${attempt + 1} failed (retryable): ${lastError.message}. Retrying in ${delay}ms...`,
      );

      await sleep(delay);
      delay = Math.min(
        delay * RETRY_CONFIG.backoffMultiplier,
        RETRY_CONFIG.maxDelayMs,
      );
    }
  }

  throw lastError;
}

const PROVIDERS: Array<{
  name: string;
  model: LanguageModel;
  lite?: LanguageModel;
}> = [
  {
    name: "gemini",
    model: google(MODEL),
    lite: google(MODEL_LITE),
  },
  {
    name: "cerebras",
    model: cerebras("zai-glm-4.7"),
  },
  {
    name: "nebius",
    model: nebius.chat("Qwen/Qwen3-235B-A22B"),
  },
];

export const modelLite = google(MODEL_LITE);
export const modelFlash = google(MODEL);

type BaseOptions = {
  prompt: string;
  system?: string;
  temperature?: number;
  topP?: number;
  lite?: boolean;
};

type GenerateObjectOptions<T> = BaseOptions & {
  schema: z.ZodType<T>;
};

type GenerateArrayOptions<T> = BaseOptions & {
  elementSchema: z.ZodType<T>;
};

/**
 * Generate a structured object using AI with automatic provider fallback and retry logic.
 * Returns both the generated object and the name of the provider that succeeded.
 */
export async function generateAIObject<T>(
  opts: GenerateObjectOptions<T>,
): Promise<{ object: T; providerName: string }> {
  const errors: Error[] = [];

  for (const provider of PROVIDERS) {
    const model = opts.lite && provider.lite ? provider.lite : provider.model;

    try {
      const result = await withRetry(
        () =>
          generateObject({
            model,
            schema: opts.schema,
            prompt: opts.prompt,
            system: opts.system,
            temperature: opts.temperature,
            topP: opts.topP,
          }),
        provider.name,
      );

      if (errors.length > 0) {
        logger.info(
          `[AI] ${provider.name} succeeded after ${errors.length} provider fallback(s)`,
        );
      }

      return { object: result.object as T, providerName: provider.name };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errors.push(error);
      logger.warn(
        `[AI] ${provider.name} exhausted all retries: ${error.message}`,
      );
    }
  }

  throw new AggregateError(errors, "All AI providers failed after retries");
}

/**
 * Generate an array of structured objects using AI with automatic provider fallback and retry logic.
 * Returns both the generated array and the name of the provider that succeeded.
 */
export async function generateAIArray<T>(
  opts: GenerateArrayOptions<T>,
): Promise<{ array: T[]; providerName: string }> {
  const errors: Error[] = [];

  for (const provider of PROVIDERS) {
    const model = opts.lite && provider.lite ? provider.lite : provider.model;

    try {
      const result = await withRetry(
        () =>
          generateObject({
            model,
            output: "array",
            schema: opts.elementSchema,
            prompt: opts.prompt,
            system: opts.system,
            temperature: opts.temperature,
            topP: opts.topP,
          }),
        provider.name,
      );

      if (errors.length > 0) {
        logger.info(
          `[AI] ${provider.name} succeeded after ${errors.length} provider fallback(s)`,
        );
      }

      return { array: result.object as T[], providerName: provider.name };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      errors.push(error);
      logger.warn(
        `[AI] ${provider.name} exhausted all retries: ${error.message}`,
      );
    }
  }

  throw new AggregateError(errors, "All AI providers failed after retries");
}

export function handleAiError(
  error: unknown,
  context: string,
): { status: number; body: { error: string } } {
  logger.error(`AI ${context} error:`, error);

  const errorMessage = error instanceof Error ? error.message : String(error);
  let errorString = "";
  try {
    errorString = JSON.stringify(error);
  } catch {
    errorString = errorMessage;
  }

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

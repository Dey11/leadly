import { z } from "zod";
import { google } from "@ai-sdk/google";
import { cerebras } from "@ai-sdk/cerebras";
import { generateText, Output, type LanguageModel } from "ai";
import { AI_PROVIDERS, type AIProviderConfig } from "./constants";
import logger from "./logger";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const wavespeed = createOpenAICompatible({
  name: "wavespeed",
  baseURL: "https://llm.wavespeed.ai/v1",
  apiKey: process.env.WAVESPEED_API_KEY ?? "",
  supportsStructuredOutputs: true,
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
  abortSignal?: AbortSignal,
): Promise<T> {
  let lastError: Error | undefined;
  let delay = RETRY_CONFIG.initialDelayMs;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    if (abortSignal?.aborted) {
      throw abortSignal.reason instanceof Error
        ? abortSignal.reason
        : new Error("AI request timed out");
    }

    try {
      const result = await fn();
      // Log every successful generation
      if (attempt > 0) {
        logger.info(
          `[AI] ${providerName} succeeded on attempt ${attempt + 1} after ${attempt} retries`,
        );
      } else {
        logger.info(`[AI] ${providerName} succeeded`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (abortSignal?.aborted) {
        throw abortSignal.reason instanceof Error
          ? abortSignal.reason
          : lastError;
      }

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

// Build PROVIDERS array from centralized config
function createProviderModel(config: AIProviderConfig): LanguageModel {
  switch (config.name) {
    case "gemini":
      return google(config.model);
    case "cerebras":
      return cerebras(config.model);
    case "wavespeed":
      return wavespeed(config.model);
    default:
      throw new Error(`Unknown provider: ${config.name}`);
  }
}

function createProviderLiteModel(
  config: AIProviderConfig,
): LanguageModel | undefined {
  if (!config.liteModel) return undefined;
  switch (config.name) {
    case "gemini":
      return google(config.liteModel);
    case "cerebras":
      return config.liteModel ? cerebras(config.liteModel) : undefined;
    case "wavespeed":
      return config.liteModel ? wavespeed(config.liteModel) : undefined;
    default:
      return undefined;
  }
}

const PROVIDERS: Array<{
  name: string;
  model: LanguageModel;
  lite?: LanguageModel;
}> = AI_PROVIDERS.filter((p) => p.enabled).map((config) => ({
  name: config.name,
  model: createProviderModel(config),
  lite: createProviderLiteModel(config),
}));

type BaseOptions = {
  prompt: string;
  system?: string;
  temperature?: number;
  topP?: number;
  lite?: boolean;
  providerOrder?: string[]; // e.g., ["cerebras", "gemini"]
  timeoutMs?: number;
};

type GenerateObjectOptions<T> = BaseOptions & {
  schema: z.ZodType<T>;
};

type GenerateArrayOptions<T> = BaseOptions & {
  elementSchema: z.ZodType<T>;
};

/**
 * Generate a structured object using AI with automatic provider fallback and retry logic.
 * Uses generateText with Output.object() as per AI SDK 6.0.
 * Returns both the generated object and the name of the provider that succeeded.
 */
export async function generateAIObject<T>(
  opts: GenerateObjectOptions<T>,
): Promise<{ object: T; providerName: string }> {
  const errors: Error[] = [];
  const abortSignal = opts.timeoutMs
    ? AbortSignal.timeout(opts.timeoutMs)
    : undefined;

  const sortedProviders = [...PROVIDERS].sort((a, b) => {
    if (!opts.providerOrder || opts.providerOrder.length === 0) return 0;
    const aIndex = opts.providerOrder.indexOf(a.name);
    const bIndex = opts.providerOrder.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  for (const provider of sortedProviders) {
    const model = opts.lite && provider.lite ? provider.lite : provider.model;

    try {
      const result = await withRetry(
        () =>
          generateText({
            model,
            output: Output.object({
              schema: opts.schema,
            }),
            prompt: opts.prompt,
            system: opts.system,
            temperature: opts.temperature,
            topP: opts.topP,
            abortSignal,
            providerOptions: AI_PROVIDER_OPTIONS,
          }),
        provider.name,
        abortSignal,
      );

      if (errors.length > 0) {
        logger.info(
          `[AI] ${provider.name} succeeded after ${errors.length} provider fallback(s)`,
        );
      }

      return { object: result.output as T, providerName: provider.name };
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
 * Uses generateText with Output.array() as per AI SDK 6.0.
 * Returns both the generated array and the name of the provider that succeeded.
 */
export async function generateAIArray<T>(
  opts: GenerateArrayOptions<T>,
): Promise<{ array: T[]; providerName: string }> {
  const errors: Error[] = [];
  const abortSignal = opts.timeoutMs
    ? AbortSignal.timeout(opts.timeoutMs)
    : undefined;

  const sortedProviders = [...PROVIDERS].sort((a, b) => {
    if (!opts.providerOrder || opts.providerOrder.length === 0) return 0;
    const aIndex = opts.providerOrder.indexOf(a.name);
    const bIndex = opts.providerOrder.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  for (const provider of sortedProviders) {
    const model = opts.lite && provider.lite ? provider.lite : provider.model;

    try {
      const result = await withRetry(
        () =>
          generateText({
            model,
            output: Output.array({
              element: opts.elementSchema,
            }),
            prompt: opts.prompt,
            system: opts.system,
            temperature: opts.temperature,
            topP: opts.topP,
            abortSignal,
            providerOptions: AI_PROVIDER_OPTIONS,
          }),
        provider.name,
        abortSignal,
      );

      if (errors.length > 0) {
        logger.info(
          `[AI] ${provider.name} succeeded after ${errors.length} provider fallback(s)`,
        );
      }

      return { array: result.output as T[], providerName: provider.name };
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

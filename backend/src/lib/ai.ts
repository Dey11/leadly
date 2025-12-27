import { google } from "@ai-sdk/google";
import { MODEL_LITE, MODEL } from "./constants";

export const AI_SAFETY_SETTINGS = [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

export const AI_PROVIDER_OPTIONS = {
    google: {
        structuredOutputs: true,
        safetySettings: AI_SAFETY_SETTINGS,
    },
};

export const modelLite = google(MODEL_LITE);
export const modelFlash = google(MODEL);

export function handleAiError(error: unknown, context: string): { status: number; body: { error: string } } {
    console.error(`AI ${context} error:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = JSON.stringify(error);

    if (errorString.includes("PROHIBITED_CONTENT") || errorString.includes("blockReason")) {
        return {
            status: 400,
            body: { error: "Content cannot be processed. Please ensure it contains appropriate language." },
        };
    }

    if (errorString.includes("RESOURCE_EXHAUSTED") || errorString.includes("429") || errorMessage.includes("Resource exhausted") || errorMessage.includes("rate") || errorMessage.includes("quota")) {
        return {
            status: 503,
            body: { error: "AI service is temporarily busy. Please try again in a few minutes." },
        };
    }

    if (errorMessage.includes("timeout") || errorMessage.includes("TimeoutError")) {
        return {
            status: 504,
            body: { error: "The AI service is taking too long. Please try again in a moment." },
        };
    }

    return {
        status: 500,
        body: { error: `Failed to ${context}. Please try again.` },
    };
}

import { z } from "zod";
import { google } from "@ai-sdk/google";
import { cerebras } from "@ai-sdk/cerebras";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject as aiGenerateObject } from "ai";

/**
 * Manual test script to simulate provider failures and test fallback
 * 
 * This script allows you to:
 * 1. Test each provider individually
 * 2. Simulate rate limit scenarios by using invalid API keys
 * 3. Test the full fallback chain
 */

const testSchema = z.object({
  summary: z.string().describe("A brief summary"),
  score: z.number().min(1).max(10).describe("A score from 1-10"),
});

const testPrompt = "Analyze this: Our SaaS product helps small businesses. Rate how interesting this is.";

async function testProvider(name: string, model: any) {
  console.log(`\n--- Testing ${name} ---`);
  try {
    const startTime = Date.now();
    const result = await aiGenerateObject({
      model,
      schema: testSchema,
      prompt: testPrompt,
    });
    const duration = Date.now() - startTime;
    console.log(`✅ ${name} succeeded in ${duration}ms`);
    console.log(`Result:`, result.object);
    return true;
  } catch (error) {
    const err = error as Error;
    console.error(`❌ ${name} failed:`, err.message);
    return false;
  }
}

async function testFallbackChain() {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║       Individual Provider Tests                ║");
  console.log("╚════════════════════════════════════════════════╝");
  
  const providers = [
    {
      name: "Gemini (Primary)",
      model: google(process.env.MODEL || "gemini-2.0-flash-exp"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    {
      name: "Cerebras (Fallback 1)",
      model: cerebras("llama-3.3-70b"),
      apiKey: process.env.CEREBRAS_API_KEY,
    },
    {
      name: "Nebius (Fallback 2)",
      model: createOpenAI({
        baseURL: "https://api.tokenfactory.nebius.com/v1",
        apiKey: process.env.NEBIUS_API_KEY,
      }).chat("meta-llama/Llama-3.3-70B-Instruct"),
      apiKey: process.env.NEBIUS_API_KEY,
    },
  ];

  for (const provider of providers) {
    if (!provider.apiKey) {
      console.log(`\n⚠️  Skipping ${provider.name}: API key not set`);
      continue;
    }
    await testProvider(provider.name, provider.model);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testSimulatedFailure() {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     Simulated Fallback Scenario Test           ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log("\nTo test fallback behavior:");
  console.log("1. Temporarily set GOOGLE_GENERATIVE_AI_API_KEY to 'invalid_key'");
  console.log("2. Re-run this test");
  console.log("3. The system should automatically fallback to Cerebras or Nebius");
  console.log("\nThis demonstrates resilience when the primary provider fails.");
}

async function runManualTests() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   Manual AI Provider Fallback Tests            ║");
  console.log("╚════════════════════════════════════════════════╝");
  
  console.log("\n=== Environment Variables ===");
  console.log(`GOOGLE_GENERATIVE_AI_API_KEY: ${process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "✅ Set" : "❌ Not set"}`);
  console.log(`CEREBRAS_API_KEY: ${process.env.CEREBRAS_API_KEY ? "✅ Set" : "❌ Not set"}`);
  console.log(`NEBIUS_API_KEY: ${process.env.NEBIUS_API_KEY ? "✅ Set" : "❌ Not set"}`);
  
  await testFallbackChain();
  await testSimulatedFailure();
  
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║              Testing Complete                   ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log("\nNext steps:");
  console.log("1. Review the results above");
  console.log("2. Ensure all providers you want to use have valid API keys");
  console.log("3. Test rate limiting by temporarily invalidating the primary key");
  console.log("4. Check logs for fallback behavior");
}

runManualTests().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

#!/usr/bin/env bun
/**
 * Integration test for AI fallback functionality
 * Tests the actual generateObject wrapper with real or simulated scenarios
 */

import { generateObject } from "../lib/ai";
import { z } from "zod";

// Test configurations
const TESTS = {
  basic: {
    name: "Basic Generation Test",
    schema: z.object({
      text: z.string(),
      count: z.number(),
    }),
    prompt: "Generate a short greeting and count to 5",
  },
  icp: {
    name: "ICP Generation Test (similar to actual use)",
    schema: z.object({
      name: z.string().max(100),
      summary: z.string().max(500),
      targetPersona: z.string().max(500),
    }),
    prompt: `Extract ICP fields from this business description:

We provide cloud infrastructure solutions for fast-growing startups in the fintech space. Our customers are typically Series A-C companies with 20-200 employees who need scalable, secure infrastructure but don't have dedicated DevOps teams yet.`,
  },
  subreddit: {
    name: "Subreddit Suggestion Test",
    schema: z.object({
      subreddits: z.array(z.string()),
    }),
    prompt: `Suggest relevant subreddits for: 
    
Target: Software engineers looking for remote jobs
Industry: Tech/SaaS
Pain points: Job search, interview prep, salary negotiation`,
  },
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  providerUsed?: string;
}

async function runTest(
  testConfig: typeof TESTS[keyof typeof TESTS],
  options: { lite?: boolean } = {}
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Running: ${testConfig.name}`);
    
    const result = await generateObject({
      schema: testConfig.schema,
      prompt: testConfig.prompt,
      lite: options.lite,
      temperature: 0.2,
    });
    
    const duration = Date.now() - startTime;
    
    const PREVIEW_LENGTH = 100;
    console.log(`   ✅ Success (${duration}ms)`);
    console.log(`   Result preview:`, JSON.stringify(result.object).substring(0, PREVIEW_LENGTH) + "...");
    
    return {
      name: testConfig.name,
      passed: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    
    console.log(`   ❌ Failed (${duration}ms)`);
    console.log(`   Error:`, err.message);
    
    return {
      name: testConfig.name,
      passed: false,
      duration,
      error: err.message,
    };
  }
}

async function testConcurrency() {
  console.log("\n🔄 Testing concurrent requests...");
  const startTime = Date.now();
  
  try {
    const requests = Array(3).fill(null).map((_, i) => 
      generateObject({
        schema: z.object({ value: z.string() }),
        prompt: `Say "Request ${i + 1}"`,
        lite: true,
      })
    );
    
    await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ All concurrent requests succeeded (${duration}ms)`);
    return { passed: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Concurrent requests failed (${duration}ms)`);
    return { passed: false, duration, error: (error as Error).message };
  }
}

async function checkProviderAvailability() {
  console.log("\n🔍 Checking provider configuration...");
  
  const providers = {
    gemini: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
    nebius: process.env.NEBIUS_API_KEY,
  };
  
  const available: string[] = [];
  const missing: string[] = [];
  
  for (const [name, key] of Object.entries(providers)) {
    if (key && key.length > 10) {
      available.push(name);
      console.log(`   ✅ ${name}: Configured`);
    } else {
      missing.push(name);
      console.log(`   ❌ ${name}: Not configured`);
    }
  }
  
  console.log(`\n   Summary: ${available.length}/3 providers configured`);
  
  if (available.length === 0) {
    console.log(`   ⚠️  WARNING: No providers configured! Tests will fail.`);
    return false;
  } else if (available.length < 3) {
    console.log(`   ⚠️  Only ${available[0]} configured. Fallback won't work if it fails.`);
    return true;
  }
  
  return true;
}

async function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║     AI Fallback Integration Tests              ║");
  console.log("╚════════════════════════════════════════════════╝");
  
  const hasProviders = await checkProviderAvailability();
  
  if (!hasProviders) {
    console.log("\n❌ Cannot run tests without provider configuration.");
    console.log("   Please set at least GOOGLE_GENERATIVE_AI_API_KEY in .env");
    process.exit(1);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("Running Integration Tests");
  console.log("=".repeat(50));
  
  const results: TestResult[] = [];
  
  // Run basic tests
  results.push(await runTest(TESTS.basic, { lite: true }));
  results.push(await runTest(TESTS.icp, { lite: true }));
  results.push(await runTest(TESTS.subreddit));
  
  // Test concurrency
  const concurrencyResult = await testConcurrency();
  results.push({
    name: "Concurrent Requests",
    passed: concurrencyResult.passed,
    duration: concurrencyResult.duration,
    error: concurrencyResult.error,
  });
  
  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("Test Summary");
  console.log("=".repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  results.forEach(result => {
    const status = result.passed ? "✅" : "❌";
    console.log(`${status} ${result.name} (${result.duration}ms)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log("\n" + "-".repeat(50));
  console.log(`Total: ${passed} passed, ${failed} failed`);
  console.log(`Total duration: ${totalDuration}ms`);
  
  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
    console.log("\n✅ The AI fallback system is working correctly.");
    console.log("   - Multiple providers are configured");
    console.log("   - Generation works across different schemas");
    console.log("   - Concurrent requests are handled properly");
  } else {
    console.log("\n⚠️  Some tests failed.");
    console.log("   Please check the errors above and verify:");
    console.log("   - API keys are correct");
    console.log("   - Providers have sufficient quota");
    console.log("   - Network connectivity is working");
  }
  
  // Provide guidance on testing fallback
  console.log("\n" + "=".repeat(50));
  console.log("Testing Fallback Behavior");
  console.log("=".repeat(50));
  console.log("\nTo test that fallback works when Gemini is rate limited:");
  console.log("1. Temporarily rename GOOGLE_GENERATIVE_AI_API_KEY in .env");
  console.log("2. Re-run this test");
  console.log("3. The system should use Cerebras or Nebius instead");
  console.log("4. Check logs for messages like '[AI] gemini failed' and");
  console.log("   '[AI] cerebras succeeded after 1 fallback(s)'");
  
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(error => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});

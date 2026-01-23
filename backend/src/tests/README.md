# AI Provider Fallback Tests

This directory contains tests for validating the AI provider fallback functionality implemented in `/src/lib/ai.ts`.

## Overview

The fallback system provides resilience by automatically trying alternative AI providers when the primary provider fails (e.g., due to rate limiting, quota exhaustion, or network issues).

**Provider Chain:**
1. **Gemini** (Google) - Primary provider with `gemini-2.0-flash-exp`
2. **Cerebras** - Fallback #1 with `llama-3.3-70b`
3. **Nebius** - Fallback #2 with `meta-llama/Llama-3.3-70B-Instruct`

## Test Files

### 1. `integration-test.ts` ⭐ (Recommended)
**Comprehensive integration test that simulates real application usage.**

```bash
npm run test:ai-integration
```

Tests:
- ✅ Basic generation with simple schemas
- ✅ ICP generation (matches actual controller usage)
- ✅ Subreddit suggestion generation
- ✅ Concurrent request handling
- ✅ Provider configuration validation

**This is the main test you should run to validate everything works.**

### 2. `ai-fallback.test.ts`
**Automated test suite with multiple scenarios.**

```bash
npm run test:ai-fallback
```

Tests:
- Environment variable validation
- Normal operation
- Multiple concurrent requests
- Edge cases (short prompts, complex schemas)

### 3. `manual-provider-test.ts`
**Manual test for individual provider testing.**

```bash
npm run test:ai-manual
```

Tests each provider independently to verify:
- API key validity
- Provider availability
- Individual provider performance

## Setup

### Environment Variables

Ensure these are set in your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
NEBIUS_API_KEY=your_nebius_api_key
```

**Minimum requirement:** At least `GOOGLE_GENERATIVE_AI_API_KEY` must be set.

For full fallback functionality, configure all three providers.

## Testing Fallback Behavior

### Scenario 1: Test with all providers available
```bash
# Configure all three API keys in .env
npm run test:ai-integration
```

Expected: All tests pass using Gemini (primary provider).

### Scenario 2: Test Cerebras fallback
```bash
# In .env, temporarily rename or invalidate Google key:
# GOOGLE_GENERATIVE_AI_API_KEY_DISABLED=your_google_api_key
# GOOGLE_GENERATIVE_AI_API_KEY=invalid_key

npm run test:ai-integration
```

Expected: 
- Tests pass using Cerebras
- Logs show: `[AI] gemini failed` and `[AI] cerebras succeeded after 1 fallback(s)`

### Scenario 3: Test Nebius fallback
```bash
# In .env, invalidate both Google and Cerebras keys:
# GOOGLE_GENERATIVE_AI_API_KEY=invalid_key
# CEREBRAS_API_KEY=invalid_key

npm run test:ai-integration
```

Expected:
- Tests pass using Nebius
- Logs show: `[AI] gemini failed`, `[AI] cerebras failed`, `[AI] nebius succeeded after 2 fallback(s)`

### Scenario 4: Test all providers fail
```bash
# In .env, invalidate all keys:
# GOOGLE_GENERATIVE_AI_API_KEY=invalid_key
# CEREBRAS_API_KEY=invalid_key
# NEBIUS_API_KEY=invalid_key

npm run test:ai-integration
```

Expected:
- Tests fail with `AggregateError: All AI providers failed`
- Logs show all three providers failed

## Monitoring in Production

Watch for these log messages:

### Success (no fallback needed)
```
(No special logs - request succeeded with primary provider)
```

### Success with fallback
```
[AI] gemini failed: RESOURCE_EXHAUSTED: Rate limit exceeded
[AI] cerebras succeeded after 1 fallback(s)
```

### All providers failed
```
[AI] gemini failed: RESOURCE_EXHAUSTED: Rate limit exceeded
[AI] cerebras failed: API key invalid
[AI] nebius failed: Connection timeout
```

## Troubleshooting

### Tests fail with "API key not set"
- Check your `.env` file has the required keys
- Verify `.env` is in `/backend` directory
- Restart your development server after updating `.env`

### Tests fail with rate limit errors
- This is expected if testing rate limits
- Wait a few minutes and try again
- Or use a different API key

### Tests fail with "Invalid API key"
- Verify your API keys are correct
- Check for extra spaces or quotes in `.env`
- Ensure keys have proper permissions

### Concurrent requests fail
- Some providers have strict rate limits for concurrent requests
- This is expected behavior and fallback will handle it

## Implementation Details

The fallback logic in `/src/lib/ai.ts`:

```typescript
export async function generateObject<T>(opts: GenerateOptions<T>) {
  const errors: Error[] = [];

  for (const provider of PROVIDERS) {
    try {
      const result = await aiGenerateObject({...});
      
      if (errors.length > 0) {
        logger.info(`[AI] ${provider.name} succeeded after ${errors.length} fallback(s)`);
      }
      
      return result;
    } catch (err) {
      errors.push(error);
      logger.warn(`[AI] ${provider.name} failed: ${error.message}`);
    }
  }

  throw new AggregateError(errors, "All AI providers failed");
}
```

This ensures:
1. Providers are tried in order
2. Failures are logged for debugging
3. Success after fallback is logged for monitoring
4. All errors are collected if all providers fail

## Next Steps

After validating tests pass:

1. ✅ Monitor logs in production for fallback occurrences
2. ✅ Set up alerts for "All AI providers failed" errors
3. ✅ Track which providers are used most often
4. ✅ Adjust provider order based on reliability/cost
5. ✅ Consider adding more fallback providers if needed

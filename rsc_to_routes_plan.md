# Plan: Mode-Specific Data Fetching

## Problem

Currently, `router.refresh()` reloads the **entire page**, causing both `/keyword-schedule` and `/schedule` endpoints to be called regardless of which mode (ICP/Keyword) the user is in.

```
ICP Mode → Still fetches: /keyword-schedule, /keyword-stats
Keyword Mode → Still fetches: /icps, /leads, /schedule
```

This is wasteful and causes 404s when resources don't exist for the current mode.

## Root Cause

```tsx
// overview-switcher.tsx
<OverviewSwitcher
  leadGenContent={<OverviewContent />} // Server component - always rendered
  keywordContent={<KeywordOverviewContent />} // Server component - always rendered
/>
```

Both server components are rendered on the server before the client decides which to show. The `RefreshController` then uses `router.refresh()` which re-renders BOTH.

## Proposed Solution

### Option A: Conditional Server Component Loading (Recommended)

Move mode detection to server-side and only render the relevant component.

**Changes:**

1. Store mode in cookies instead of localStorage
2. Read cookie in layout or page
3. Only render the active mode's component

```tsx
// dashboard/page.tsx
export default async function DashboardHome() {
  const mode = cookies().get("leadly-product-mode")?.value ?? "leadgen";

  return (
    <Suspense fallback={<OverviewSkeleton />}>
      {mode === "keyword" ? <KeywordOverviewContent /> : <OverviewContent />}
    </Suspense>
  );
}
```

**Pros:**

- Minimal code change
- Keeps server components
- Only fetches data for active mode

**Cons:**

- Requires cookie for mode storage
- Full page refresh on mode toggle

---

### Option B: Client-Side Data Fetching with React Query

Replace server components with client components that fetch data conditionally.

**Changes:**

1. Install `@tanstack/react-query`
2. Create API hooks: `useIcps()`, `useKeywordStats()`, etc.
3. Convert overview components to client components
4. Only call hooks based on current mode

```tsx
// Client component
function OverviewContent() {
  const { data: icps } = useIcps();
  const { data: schedule } = useSchedule();
  // ...
}

function KeywordOverviewContent() {
  const { data: stats } = useKeywordStats();
  const { data: schedule } = useKeywordSchedule();
  // ...
}
```

**Pros:**

- Full control over when data is fetched
- Only active mode fetches data
- Better caching with React Query
- Smoother mode switching

**Cons:**

- Larger refactor
- More client-side JS
- Need to handle loading states

---

### Option C: Route-Based Separation

Create separate routes for each mode.

```
/dashboard        → ICP Overview
/dashboard/keywords → Keyword Overview
```

**Pros:**

- Clean separation
- Each route only loads its data
- SEO friendly

**Cons:**

- Changes URL structure
- May affect user bookmarks

---

## Recommendation

**Option A** for quick fix, **Option B** for long-term scalability.

## Implementation Estimate

| Option | Effort    | Files Changed |
| :----- | :-------- | :------------ |
| A      | 2-3 hours | 3-4 files     |
| B      | 1-2 days  | 10+ files     |
| C      | 4-6 hours | 5-6 files     |

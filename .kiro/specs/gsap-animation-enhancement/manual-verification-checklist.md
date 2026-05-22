# Manual Verification Checklist — GSAP Animation Migration

> Compiled for Task 12.7 / 12.8 / 12.9 of `gsap-animation-enhancement`.
> Automated checks (12.1–12.6) all passed. The items below require a real
> browser session and cannot be reliably automated.

## Setup

```powershell
# From project root
npm run dev
# → Vite reports the local URL (typically http://localhost:5173)
```

Open the dev URL in a Chromium-based browser (Chrome / Edge / Brave). Open
DevTools (F12). Keep the **Console** and **Performance** tabs handy.

> 💡 If the page is blank or throws on load, copy the console error into the
> chat — that probably means a regression slipped past the build.

---

## ✅ 12.7 — Smoke test (animations work end-to-end)

### Home (`/`)

- [ ] Page loads without console errors.
- [ ] Hero badge appears with a short slide-up + fade-in (≈0.5 s).
- [ ] Hero line 1 ("Hi, I'm …") slides up + fades in **after** the badge.
- [ ] Hero line 2 (the highlighted name) reveals **per-character** via
  SplitText (each letter slides up with a slight stagger, `back.out` ease).
- [ ] Bio paragraph, CTA buttons, and social-link row appear in order, each
  offset ≈0.3 s before the previous tween ends (overlapping cascade — not
  one-after-another).
- [ ] Hero animations fire **exactly once** on mount. Reload (Ctrl+R) and
  verify they replay correctly. They must NOT fire 3× (the regression Task 7
  fixed).
- [ ] Scroll down. Each "reveal" section (`use:reveal`, `use:revealStagger`)
  fades/slides in as it enters the viewport. Re-scrolling past the section
  does NOT re-trigger (because `once: true`).
- [ ] Hover any project card / button with `use:hoverLift`: it lifts (~6 px),
  scales slightly (~1.02), and gets a soft shadow. Mouse-leave returns it
  smoothly to rest.
- [ ] Number counters (e.g. "X projects shipped", "Y posts") count up
  smoothly from 0 to the target when scrolled into view. Final number is
  exact (no float drift like `41.99999`).

### Portfolio (`/portfolio`)

- [ ] Project cards reveal as you scroll (staggered).
- [ ] Hovering a card triggers the lift + shadow + image zoom.
- [ ] Click a card → detail page (`/portfolio/[slug]`) loads.

### Portfolio detail (`/portfolio/[slug]`)

- [ ] Hero, content blocks, related projects all reveal on scroll.
- [ ] Reduced-motion is respected (will be re-tested in 12.8).

### Blog (`/blog`) and detail (`/blog/[slug]`)

- [ ] Post cards reveal on scroll.
- [ ] Article body fades/slides in on entry.
- [ ] Hover effects on cards behave like portfolio.

### Gallery (`/gallery`)

- [ ] Feed posts render.
- [ ] Infinite-scroll loader still works (this page wasn't part of the
  GSAP migration, just confirm no regressions).

### Page transitions (cross-route)

- [ ] Click between `/` ↔ `/portfolio` ↔ `/blog` ↔ `/gallery`.
- [ ] In Chromium with View Transitions support: the route swaps with a
  short crossfade (browser-native).
- [ ] In Firefox / older Safari (which lacks `startViewTransition`): the
  fallback is a short GSAP fade-out (`opacity 0`, `y -8`) → navigation →
  fade-in. Should feel similar, not janky.
- [ ] The Navbar logo morphs across navigations (View-Transitions-only —
  thanks to `view-transition-name: site-logo`).
- [ ] Navbar shrink/blur kicks in once you scroll past ≈20 px from top, and
  the progress bar (top of navbar) tracks scroll progress smoothly while
  scrubbing.

### Console

- [ ] Open DevTools → Console: **zero errors, zero warnings** related to
  GSAP / `loadGsap` / SplitText / ScrollTrigger.
- [ ] Network → check that `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText`
  are loaded **lazily** (not in the main bundle on first paint of `/`).
  They should appear after the entry chunk on the first page that triggers
  an animation.

---

## ✅ 12.8 — Reduced-motion (accessibility) test

### Toggle OS / browser preference

**Windows 11**: Settings → Accessibility → Visual effects → toggle
**Animation effects** OFF.

**Alternative (browser-only override, faster)**: DevTools → ⋮ menu →
**More tools → Rendering → Emulate CSS media feature
prefers-reduced-motion → reduce**.

Then **fully reload** each page (Ctrl+Shift+R).

### Expected behaviour with reduced-motion = reduce

- [ ] Home (`/`): hero is **fully visible immediately** — no fade-in, no
  slide-up, no per-char split. The badge / lines / bio / buttons / socials
  render in their final state on paint.
- [ ] Number counters show their **final value** immediately (e.g. "12"
  appears as 12, not animated from 0).
- [ ] Reveal-on-scroll sections are visible from the start; no fade-in as
  they enter the viewport.
- [ ] Hovering project/blog cards has **no** lift/scale/shadow tween.
  (A small CSS-level transition on `:hover` may still run — that's
  acceptable; we only kill the GSAP-driven tweens.)
- [ ] Bar charts / progress bars render at their target heights / widths
  without growing animation.
- [ ] Page transitions: the route swap is **instant** — no fade between
  pages.
- [ ] Navbar shrink toggle still works (allowed under reduced-motion since
  it's a state flip, not a tween). The scrub progress bar stays at 0 %
  width — that's intentional (Task 8.8).
- [ ] Console: still zero errors / warnings.

### Toggle back

Restore the OS / browser setting and reload. Animations should resume.

---

## ✅ 12.9 — ScrollTrigger leak test (cleanup correctness)

This validates that `gsap.context().revert()` and per-action `destroy()`
hooks are wiring up correctly across navigations. A leak would mean every
SPA navigation accumulates orphaned ScrollTrigger instances, eventually
hammering scroll performance.

### Steps

1. Open `/` in DevTools-equipped browser.
2. Open DevTools → **Console**.
3. Paste the helper once and press Enter:

   ```js
   const __getStCount = async () => {
     const m = await import('/node_modules/gsap/ScrollTrigger.js').catch(() => null);
     // dev-server resolves bare specifiers — fallback if path differs:
     const ST = m?.ScrollTrigger ?? (await import('gsap/ScrollTrigger')).ScrollTrigger;
     return ST.getAll().length;
   };
   ```

   > 💡 If the import path errors out, first trigger any animation on the
   > page (scroll once) so GSAP is loaded, then run:
   > ```js
   > gsap.core.globals().ScrollTrigger.getAll().length
   > ```
   > or pull `ScrollTrigger` directly from the already-loaded module via
   > the Sources panel.

4. Note the baseline count after `/` finishes mounting:
   `await __getStCount()` → record the number (call it `N0`).

5. Navigate `/` → `/portfolio` → `/` → `/portfolio` → `/` → `/portfolio`
   → `/` (5 round-trips). After each return to `/`, record
   `await __getStCount()`.

### Pass criteria

- [ ] The count **stabilises** after the first 1–2 trips (it may grow
  slightly because the destination page registers its own triggers, but
  on returning to `/`, the count should drop back to roughly `N0`).
- [ ] The count does **not** grow monotonically with each navigation
  (e.g. 3 → 6 → 9 → 12 → 15 would indicate a leak — fail).
- [ ] After 5 round-trips, the count when on `/` is within ±2 of `N0`.

### If a leak is observed

Likely culprits to investigate:

- A component creating ScrollTriggers outside `gsap.context()`.
- An action whose `destroy()` doesn't kill its trigger.
- The Navbar `ctx.revert()` not firing on layout unmount (it shouldn't —
  the Navbar persists across `(public)` routes — but verify it isn't
  re-creating triggers on every prop change).

Document findings in the chat and we can iterate.

---

## Summary checklist

- [ ] 12.7 — Smoke test passed on Home, Portfolio, Blog, Gallery + transitions.
- [ ] 12.8 — Reduced-motion respected on every page (all animations skipped).
- [ ] 12.9 — `ScrollTrigger.getAll().length` stable across 5 round-trips.

When all three are checked, Task 12 is fully done.

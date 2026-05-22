/**
 * GSAP singleton lazy loader.
 *
 * Provides idempotent dynamic-import of `gsap`, `gsap/ScrollTrigger`, and
 * `gsap/SplitText`, plus a single `gsap.registerPlugin()` call for the
 * lifetime of the page. SSR-safe: in non-browser environments the loader
 * resolves with `null` without triggering any dynamic import.
 *
 * Sub-task 1.2 implements the function shell: SSR guard + concurrent
 * dynamic imports + bundle assembly. Sub-task 1.3 wires memoization so
 * that subsequent calls return the same promise reference (Requirement
 * 1.4). Sub-task 1.4 invokes `gsap.registerPlugin(ScrollTrigger,
 * SplitText)` exactly once via the `registered` flag (Requirement 1.3).
 * Sub-task 1.5 persists that flag on `globalThis.__gsapRegistered` so
 * Vite HMR module replacement does not double-register the plugins
 * (Requirement 1.8 / AD-1). Sub-task 1.6 exposes `isGsapLoaded()` as a
 * synchronous read of that same flag (Requirement 1.6 / 1.7) so callers
 * can short-circuit work that depends on GSAP being ready. Sub-task 1.7
 * tightens the public types: `GsapBundle` now references the real types
 * shipped with the `gsap` package (`typeof import('gsap').gsap`,
 * `typeof import('gsap/ScrollTrigger').ScrollTrigger`,
 * `typeof import('gsap/SplitText').SplitText`) so call sites get full
 * IntelliSense and type-checking when consuming the bundle. Sub-task
 * 1.8 formalises import-failure handling (Requirement 1.9): if any of
 * the three dynamic imports rejects (network error, chunk load failure,
 * plugin registration throwing), the rejection MUST propagate to the
 * caller. The native `Promise.all` chain rejects naturally, but because
 * the rejected promise is memoized in `cached`, subsequent callers
 * would otherwise be permanently stuck with the same rejected promise.
 * The `.catch` handler in `loadGsap()` therefore (a) resets `cached`
 * to `null` so a later call can re-attempt the import (retry
 * semantics), and (b) re-throws the original error to preserve the
 * caller's error-handling contract. `isGsapLoaded()` remains `false`
 * after a failure because `globalThis.__gsapRegistered` is only set
 * inside the success branch — never in the catch.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Result of a successful `loadGsap()` call. Each field is the live
 * GSAP class/instance produced by the corresponding dynamic import,
 * typed against the `.d.ts` files shipped with the `gsap` package:
 *
 *   - `gsap`          → the GSAP core singleton (named `gsap` export
 *                       of the `gsap` module; also the default export).
 *   - `ScrollTrigger` → the `ScrollTrigger` plugin class (named export
 *                       of `gsap/ScrollTrigger`).
 *   - `SplitText`     → the `SplitText` plugin class (named export of
 *                       `gsap/SplitText`).
 *
 * Using `typeof import(...)` keeps the import path/type relationship
 * explicit and avoids a top-level static import (which would defeat
 * the SSR-safe lazy-load contract of `loadGsap()`).
 */
export type GsapBundle = {
	gsap: typeof import('gsap').gsap;
	ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
	SplitText: typeof import('gsap/SplitText').SplitText;
};

// ---------------------------------------------------------------------------
// Module-scope state
// ---------------------------------------------------------------------------

/**
 * Shape of the (single) `globalThis` slot used to persist loader state
 * across Vite HMR module replacement. When the dev server hot-reloads
 * `gsap-client.ts`, every module-scope `let` is wiped, but the live
 * `globalThis` object survives — so we use it as the source of truth
 * for the "plugins already registered" flag (Requirement 1.8 / AD-1).
 */
type GsapClientGlobal = {
	/** `true` once `gsap.registerPlugin(ScrollTrigger, SplitText)` has run. */
	__gsapRegistered?: boolean;
};

/**
 * Typed view of `globalThis` exposing the loader's persistent slots.
 * Defined once so the cast doesn't have to be repeated at every
 * read/write site below.
 */
const globalState = globalThis as GsapClientGlobal;

/**
 * Memoized promise for the GSAP bundle. Remains `null` until `loadGsap()`
 * is invoked for the first time in the browser; thereafter every caller
 * receives the same promise reference (idempotent memoization).
 *
 * Note: this `let` is module-scoped and therefore reset on Vite HMR
 * module replacement. That is fine because the dev-mode cost of
 * re-running the dynamic imports is acceptable; what we must NOT lose
 * across HMR is the `registered` flag below — re-calling
 * `gsap.registerPlugin()` after HMR would duplicate plugin registration
 * (Requirement 1.8). The flag is therefore persisted via `globalThis`.
 */
let cached: Promise<GsapBundle | null> | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Lazy-load `gsap` core together with the `ScrollTrigger` and `SplitText`
 * plugins.
 *
 * - In a non-browser environment (`typeof window === 'undefined'`) the
 *   loader resolves with `null` without triggering any dynamic import,
 *   keeping SSR safe (Requirement 1.2). The SSR result is intentionally
 *   NOT memoized so that a later browser-side call can still trigger
 *   the real import.
 * - In the browser the three modules are imported concurrently via
 *   `Promise.all(...)` and assembled into a `GsapBundle` (Requirement 1.3,
 *   1.5). The resulting promise is memoized in module scope so every
 *   subsequent call returns the **identical** promise reference
 *   (Requirement 1.4) — no re-import, no duplicate plugin registration.
 *   Inside the resolver, `gsap.registerPlugin(ScrollTrigger, SplitText)`
 *   is invoked exactly once, guarded by the `globalThis.__gsapRegistered`
 *   flag (Requirement 1.3, 1.8) so that Vite HMR module replacement
 *   cannot re-register the plugins.
 *
 * Failure semantics (Requirement 1.9):
 *
 * - If any of the three dynamic imports rejects (or `registerPlugin`
 *   throws synchronously), the rejection is **not swallowed**. The
 *   `.catch` handler clears the memoized `cached` promise back to
 *   `null` and then re-throws the original error to the caller. This
 *   means:
 *     • the caller observes the real failure (e.g. chunk load error)
 *       and can decide how to respond;
 *     • a subsequent `loadGsap()` call will re-attempt the import
 *       rather than being permanently bound to the rejected promise
 *       (retry semantics);
 *     • `isGsapLoaded()` continues to return `false` because
 *       `globalThis.__gsapRegistered` is only flipped inside the
 *       success path, never in the catch.
 */
export function loadGsap(): Promise<GsapBundle | null> {
	// SSR guard — Requirement 1.2. Do NOT memoize the SSR `null` result:
	// a later browser-side hydration call must still be able to load
	// the real bundle.
	if (typeof window === 'undefined') {
		return Promise.resolve(null);
	}

	// Memoization — Requirement 1.4. The first browser-side call kicks
	// off the dynamic imports and stores the resulting promise; every
	// subsequent call short-circuits to the same reference (`===`).
	if (cached !== null) {
		return cached;
	}

	// Concurrent dynamic imports of GSAP core and the two plugins we
	// need. The `gsap` package is a runtime dependency (see Task 12.1),
	// so each `import(...)` is fully typed via the bundled `.d.ts`
	// files — no `@ts-expect-error` shim required.
	cached = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')])
		.then(([gsapMod, stMod, splitMod]) => {
			// The `gsap` package exposes its core as both a default export
			// and a named `gsap` export pointing to the same singleton.
			// Prefer the named export (it is the canonical surface for
			// `registerPlugin` / `to` / etc.), falling back to `default`
			// for any bundler interop edge case.
			const gsap = gsapMod.gsap ?? gsapMod.default;
			const ScrollTrigger = stMod.ScrollTrigger;
			const SplitText = splitMod.SplitText;

			// Plugin registration — Requirement 1.3 & 1.8. Register both
			// plugins exactly once per browser tab session. The flag is
			// stored on `globalThis.__gsapRegistered` so it survives Vite
			// HMR module replacement: when the dev server hot-reloads
			// `gsap-client.ts`, the module-scope `cached` promise is reset
			// and the dynamic imports re-run, but `globalThis` is preserved
			// — preventing `gsap.registerPlugin()` from being invoked more
			// than once per tab (AD-1).
			if (globalState.__gsapRegistered !== true) {
				gsap.registerPlugin(ScrollTrigger, SplitText);
				globalState.__gsapRegistered = true;
			}

			return { gsap, ScrollTrigger, SplitText } satisfies GsapBundle;
		})
		.catch((err: unknown) => {
			// Failure path — Requirement 1.9. Any rejection from the
			// three dynamic imports (or a synchronous throw inside
			// `registerPlugin`) lands here. We deliberately do NOT
			// swallow the error:
			//   1. Reset `cached` to `null` so a later `loadGsap()` call
			//      can re-attempt the import. Without this, the rejected
			//      promise would be returned forever — preventing any
			//      retry after a transient network failure.
			//   2. Re-throw the original error so the caller observes
			//      the real failure cause and can decide how to handle
			//      it (log, fall back, surface to user, …).
			// Note: `globalThis.__gsapRegistered` is only set inside the
			// success branch above, so `isGsapLoaded()` correctly stays
			// `false` after a failure (Requirement 1.6).
			cached = null;
			throw err;
		});

	return cached;
}

/**
 * Synchronous predicate reporting whether GSAP core and its plugins
 * have completed registration in this browser tab.
 *
 * - Returns `false` before `loadGsap()` has resolved successfully —
 *   covers SSR (no global state set), the period between the first
 *   `loadGsap()` invocation and its dynamic-import resolution, and any
 *   case where `loadGsap()` was never called (Requirement 1.6).
 * - Returns `true` only after `loadGsap()` resolved and
 *   `gsap.registerPlugin(ScrollTrigger, SplitText)` ran, which is the
 *   exact moment we set `globalThis.__gsapRegistered = true` inside
 *   the resolver (Requirement 1.7).
 *
 * Reading the same global flag set by the resolver — instead of, say,
 * inspecting the module-scope `cached` promise — is intentional: the
 * flag survives Vite HMR module replacement, so a hot-reloaded
 * `gsap-client.ts` correctly reports `true` immediately after HMR
 * without re-running plugin registration (Requirement 1.8 / AD-1).
 */
export function isGsapLoaded(): boolean {
	return globalState.__gsapRegistered === true;
}

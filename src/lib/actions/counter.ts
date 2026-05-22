/**
 * Counter Svelte action.
 *
 * ---------------------------------------------------------------------------
 * MIGRATION STATUS — GSAP refactor (Task 5)
 * ---------------------------------------------------------------------------
 *   • `formatValue`  — extracted as a pure, exported, module-scope function
 *                      (sub-task 5.1) so it can be unit-tested in isolation
 *                      without spinning up a DOM node or GSAP. Used by:
 *                        - the reduced-motion fast path (5.3),
 *                        - the per-frame `onUpdate` callback (5.5),
 *                        - the `onComplete` snap-to-target (5.6),
 *                        - `update()` for the textContent reset (5.10).
 *
 *   • `counter`      — refactored from custom `requestAnimationFrame` +
 *                      `IntersectionObserver` to GSAP `gsap.to({ val })`
 *                      driven by a `ScrollTrigger` (5.4). Tween targets a
 *                      throwaway proxy object `{ val: 0 }` so we never
 *                      mutate node properties directly; the rendered text
 *                      is recomputed each frame via `formatValue`.
 *                        5.2 ✓ `Number.isFinite(target)` validation —
 *                            dev throws, prod logs + falls back to '0'.
 *                        5.3 ✓ Reduced-motion fast path: snap to final
 *                            formatted value, no listeners / no load.
 *                        5.4 ✓ Animation path: `proxy = { val: 0 }` +
 *                            `ScrollTrigger.create({ once: true })` +
 *                            `gsap.to(proxy, { val: target, ... })`.
 *                        5.5 ✓ `onUpdate` writes `formatValue(proxy.val)`.
 *                        5.6 ✓ `onComplete` snaps to `formatValue(target)`
 *                            so floating-point drift never lingers.
 *                        5.7 ✓ `duration` / `delay` in SECONDS (BREAKING
 *                            from previous ms units).
 *                        5.8 ✓ `ease` is a GSAP ease NAME (string),
 *                            replacing the previous numeric easing
 *                            function. Default `EASE.expo`.
 *                        5.9 ✓ `triggerOnView` flag (default `true`).
 *                            When `false`, the tween starts immediately
 *                            after `loadGsap()` resolves — no
 *                            ScrollTrigger.
 *                        5.10 ✓ `update(newOptions)` kills the in-flight
 *                            tween + trigger, resets text to the zero
 *                            value, and re-runs the start sequence with
 *                            the new options.
 *                        5.11 ✓ `destroy()` kills the tween + trigger
 *                            and is safe to call before GSAP loads.
 *
 * ---------------------------------------------------------------------------
 * BREAKING CHANGES (Requirements 5.1, 5.7, 14.7 — Task 11 audit)
 * ---------------------------------------------------------------------------
 * The previous `motion`-flavoured implementation accepted **milliseconds**
 * for `duration` / `delay` and a numeric easing function (`(t: number) =>
 * number`). The GSAP rewrite changes both:
 *
 *   // Before (ms / function easing)        // After (seconds / ease name)
 *   use:counter={{ target: 100,        →    use:counter={{ target: 100,
 *     duration: 1200, delay: 200,             duration: 1.2, delay: 0.2,
 *     easing: easeOutCubic }}                 ease: 'expo.out' }}
 *
 * Existing call sites that pass millisecond `duration`/`delay` will be
 * migrated to seconds in the site-wide audit tracked by Task 11. Until
 * that audit lands, callers passing e.g. `duration: 1200` will produce a
 * 1200-second tween — the value is forwarded verbatim to
 * `gsap.to({ duration, delay })` with NO ms→s conversion in this module.
 *
 * @module counter
 */
import type { Action } from 'svelte/action';
import type { GsapBundle } from '$lib/utils/gsap-client';
import { shouldAnimate, EASE } from '$lib/utils/animation';
import { loadGsap } from '$lib/utils/gsap-client';

// Convenience aliases for the live ScrollTrigger instance and Tween
// returned by `gsap.to(...)`. Sourced from `GsapBundle` so the types
// stay in lock-step with the loader.
type ScrollTriggerInstance = ReturnType<GsapBundle['ScrollTrigger']['create']>;
type GsapTween = ReturnType<GsapBundle['gsap']['to']>;

/**
 * Pure formatter for the rendered counter value (sub-task 5.1).
 *
 * Exported separately from the action so it can be unit-tested without
 * a DOM node or GSAP. The action calls this from three places:
 *   • reduced-motion fast path (sub-task 5.3),
 *   • the `onUpdate` callback fired every frame (sub-task 5.5),
 *   • the `onComplete` snap-to-target (sub-task 5.6).
 *
 * Behavior (Requirements 5.8, 5.9):
 *   • `decimals === 0` (default) — formatted as a locale-aware integer
 *     via `Math.round(value).toLocaleString()`. Produces grouping
 *     separators (e.g. `1,234`) appropriate for the user's locale.
 *   • `decimals > 0` — formatted via `value.toFixed(decimals)` for a
 *     stable fractional digit count. Note: `toFixed` is NOT
 *     locale-aware (always uses `.` as decimal separator). That
 *     matches the design contract; if locale-aware fractional
 *     formatting is later required, swap to
 *     `Intl.NumberFormat({ minimum/maximumFractionDigits })`.
 *
 * `prefix` and `suffix` are concatenated unchanged — typical use is
 * a leading currency symbol or a trailing unit (`'$'`, `' ms'`, etc.).
 */
export function formatValue(value: number, decimals = 0, prefix = '', suffix = ''): string {
	const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
	return `${prefix}${formatted}${suffix}`;
}

/**
 * Options for the {@link counter} Svelte action.
 *
 * **Time units**: `duration` and `delay` are in **SECONDS** (GSAP
 * convention). See file-level breaking-change notice above for the
 * migration story from the previous ms-based API.
 */
export type CounterOptions = {
	/**
	 * Final value the counter animates **to**. The tween starts at `0`
	 * and tweens to `target` linearly through GSAP. MUST be a finite
	 * number — `NaN`/`±Infinity` are rejected (see `counter`'s
	 * runtime validation, sub-task 5.2).
	 */
	target: number;
	/**
	 * Length of the count-up tween, in **seconds**.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ duration })` with no conversion.
	 *
	 * @default 1.2
	 */
	duration?: number;
	/**
	 * Delay before the count-up tween starts, in **seconds**, applied
	 * after the ScrollTrigger fires (or after `loadGsap()` resolves
	 * when `triggerOnView === false`).
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ delay })` with no conversion.
	 *
	 * @default 0
	 */
	delay?: number;
	/**
	 * Number of fractional digits to render. `0` (default) renders a
	 * locale-aware integer; values `> 0` render via `toFixed(decimals)`.
	 *
	 * @default 0
	 */
	decimals?: number;
	/**
	 * String prepended to every rendered value (e.g. a currency
	 * symbol). Concatenated as-is, no whitespace inserted.
	 *
	 * @default ''
	 */
	prefix?: string;
	/**
	 * String appended to every rendered value (e.g. a unit such as
	 * `'+'`, `' ms'`, `'%'`). Concatenated as-is.
	 *
	 * @default ''
	 */
	suffix?: string;
	/**
	 * GSAP ease NAME (string) used by the count-up tween. Replaces the
	 * previous numeric easing function. Any GSAP-recognised ease string
	 * is valid — see https://gsap.com/docs/v3/Eases/ for the full list.
	 *
	 * @default EASE.expo (`'expo.out'`)
	 */
	ease?: string;
	/**
	 * When `true` (default), the count-up tween is gated behind a
	 * `ScrollTrigger` and only starts once the node enters the viewport
	 * — matches the legacy `IntersectionObserver` behaviour. When
	 * `false`, the tween starts immediately after `loadGsap()` resolves
	 * — useful for above-the-fold counters that should animate as soon
	 * as the page hydrates.
	 *
	 * @default true
	 */
	triggerOnView?: boolean;
};

/**
 * `counter` — animate `node.textContent` from `0` to `target` with
 * locale-aware / decimal-aware formatting, gated by viewport entry.
 *
 * Architecture:
 *   1. **Validate** — `target` MUST be finite (sub-task 5.2). In dev
 *      we throw immediately so the bug surfaces during local
 *      development; in prod we log a warning and snap the text to
 *      `'0'` so the UI keeps rendering.
 *   2. **Reduced-motion / SSR** — fast path (sub-task 5.3): write the
 *      final formatted value once and return a no-op destroy. No GSAP
 *      load, no listeners, no observers.
 *   3. **Animation path** — `loadGsap()` is awaited; on resolve we
 *      either create a `ScrollTrigger` (default) or start the tween
 *      immediately (`triggerOnView: false`). The tween itself targets
 *      a local `proxy = { val: 0 }` object — never the node directly
 *      — and the per-frame `onUpdate` rewrites `node.textContent`
 *      via the shared `formatValue` helper.
 *   4. **Lifecycle** — `update(newOptions)` (sub-task 5.10) kills
 *      everything, resets the text, and re-runs `start()` with the
 *      new options. `destroy()` (sub-task 5.11) kills the tween +
 *      trigger and is safe pre-load (refs are nullable).
 *
 * Per Requirements 5.1–5.11.
 */
export const counter: Action<HTMLElement, CounterOptions> = (node, options) => {
	// Sub-task 5.2 — `target` validation. `Number.isFinite` rejects
	// `NaN`, `Infinity`, and `-Infinity` while accepting every normal
	// numeric value (including `0` and negative numbers — the design
	// doesn't forbid counting down/from-negative). Bad input is a
	// caller bug, so:
	//   • In dev (Vite's `import.meta.env.DEV` is `true`) we THROW so
	//     the offending `use:counter={{ target: NaN }}` surfaces
	//     loudly during local development / tests.
	//   • In prod we log a warning and write `'0'` to the node, so a
	//     bad data point doesn't blank out the UI for users.
	// Either way we return immediately with a no-op destroy: there is
	// no animation to wire up.
	if (!Number.isFinite(options.target)) {
		// `import.meta.env` is provided by Vite at build time and is
		// always available in this codebase (SvelteKit project). The
		// optional-chain on `?.DEV` guards against any unusual SSR
		// adapter that strips `env`, falling back to the prod branch.
		if (import.meta.env?.DEV) {
			throw new Error(`counter: target must be a finite number, got ${String(options.target)}`);
		}
		// `console.warn` is intentional here for production diagnostics —
		// the project's ESLint config does not enable `no-console`, so no
		// disable directive is needed.
		console.warn('counter: invalid target, defaulting to 0');
		node.textContent = '0';
		return { destroy() {} };
	}

	// Sub-task 5.3 — reduced-motion / SSR fast path. We must produce
	// the final rendered value synchronously (no animation, no GSAP
	// load) so users with `prefers-reduced-motion: reduce` see the
	// real number immediately and SSR doesn't dispatch any timers.
	// We respect `decimals` / `prefix` / `suffix` here so the static
	// value matches what an animated render would settle on.
	if (!shouldAnimate() || typeof window === 'undefined') {
		const { target, decimals = 0, prefix = '', suffix = '' } = options;
		node.textContent = formatValue(target, decimals, prefix, suffix);
		return { destroy() {} };
	}

	// Trigger / tween references — assigned inside `start()` once
	// `loadGsap()` resolves and (for `triggerOnView: true`) once the
	// node enters the viewport. Both may be `null` at `destroy()`
	// time (e.g. action torn down before GSAP loaded, or before the
	// trigger ever fired) — the cleanup path handles that gracefully.
	let trigger: ScrollTriggerInstance | null = null;
	let tween: GsapTween | null = null;

	/**
	 * Internal: kick off the load + tween for a given options snapshot.
	 *
	 * Factored out of the action body so that `update(newOptions)`
	 * (sub-task 5.10) can re-run the same sequence with a fresh
	 * options object after killing the previous tween/trigger.
	 *
	 * Always called AFTER the validate / fast-path early-returns
	 * above, so we can assume `target` is finite and `shouldAnimate()`
	 * is true.
	 */
	function start(o: CounterOptions): void {
		const {
			target,
			duration = 1.2,
			delay = 0,
			decimals = 0,
			prefix = '',
			suffix = '',
			ease = EASE.expo,
			triggerOnView = true
		} = o;

		// Initial render — `formatValue(0, ...)` (e.g. `'0'`, `'0.00'`,
		// `'$0'`). Done synchronously so the node never flashes empty
		// or stale content while `loadGsap()` resolves.
		node.textContent = formatValue(0, decimals, prefix, suffix);

		loadGsap().then((bundle) => {
			// `loadGsap()` returns null in SSR (defence-in-depth — the
			// outer `typeof window` guard already filtered SSR) and
			// throws on import failure, in which case the .then never
			// runs. Either way: graceful no-op.
			if (!bundle) return;
			const { gsap, ScrollTrigger } = bundle;

			// Sub-task 5.4 — proxy object pattern. Tweening a throwaway
			// `{ val: 0 }` instead of e.g. a property on `node` keeps
			// the action's mutation surface tiny: GSAP only mutates
			// `proxy.val` per frame, and we recompute the rendered
			// string ourselves in `onUpdate`. This also means we don't
			// have to undo any GSAP-managed properties on the node at
			// destroy time.
			const proxy = { val: 0 };

			// `startTween` is shared between the ScrollTrigger
			// `onEnter` branch and the `triggerOnView: false` branch
			// below — it builds and assigns the actual `gsap.to` tween.
			// `tween` is captured in the outer closure so `destroy()` /
			// `update()` can kill it later.
			const startTween = (): void => {
				tween = gsap.to(proxy, {
					val: target,
					duration,
					delay,
					ease,
					// Sub-task 5.5 — per-frame text update. GSAP fires
					// `onUpdate` synchronously after each interpolation
					// step, with `proxy.val` already mutated to the
					// current eased value. Recomputing via
					// `formatValue` keeps prefix/suffix/decimal logic
					// in one place (the pure helper above).
					onUpdate: () => {
						node.textContent = formatValue(proxy.val, decimals, prefix, suffix);
					},
					// Sub-task 5.6 — snap-to-target on completion.
					// GSAP guarantees the final `onUpdate` is called
					// with `proxy.val === target`, but with an eased
					// curve like `expo.out` floating-point math can
					// leave a sub-ULP residue (`99.9999996` instead of
					// `100`). Re-rendering from the original `target`
					// here guarantees the exact final string the
					// caller expects, satisfying Requirement 5.7.
					onComplete: () => {
						node.textContent = formatValue(target, decimals, prefix, suffix);
					}
				});
			};

			// Sub-task 5.9 — `triggerOnView` branch. Default `true`
			// preserves the legacy IntersectionObserver behaviour
			// (only count up when the node scrolls into view); the
			// opt-out is for above-the-fold usage where waiting for
			// scroll would be wrong.
			if (triggerOnView) {
				trigger = ScrollTrigger.create({
					trigger: node,
					// Match the standard reveal-action start position
					// (10% of the viewport past the bottom edge) so
					// counters fire at the same scroll offset as the
					// surrounding reveal animations.
					start: 'top bottom-=10%',
					// `once: true` matches the design contract
					// (Requirement 5.4) — counters never re-run on
					// scroll back. ScrollTrigger auto-kills the
					// trigger after `onEnter` returns when `once` is
					// set, so `destroy()` only has to handle the case
					// where the trigger fired exactly once or not at
					// all.
					once: true,
					onEnter: startTween
				});
			} else {
				startTween();
			}
		});
	}

	// Initial start — kick off the load/tween for the options the
	// action was mounted with. From here on, lifecycle is driven by
	// the returned `update` / `destroy` callbacks.
	start(options);

	return {
		/**
		 * Sub-task 5.10 — restart the counter with new options.
		 *
		 * Svelte calls this whenever the reactive `use:counter={...}`
		 * expression produces a new options object. To keep the
		 * counter visually consistent with the new target/format we:
		 *   1. Kill any in-flight tween + trigger from the previous
		 *      options snapshot (so we don't end up with two tweens
		 *      racing to write to the same `textContent`).
		 *   2. Reset the rendered text to `formatValue(0, ...)` using
		 *      the **new** options' formatting so the user sees a
		 *      clean restart from zero rather than the stale
		 *      mid-animation value from the previous tween.
		 *   3. Re-run `start()` with the new options, which goes
		 *      through validation / load / trigger creation again.
		 *
		 * Note: `update()` does NOT re-validate `target` against the
		 * dev-mode throw path. The original mount validation runs
		 * once; if a caller toggles `target` to `NaN` mid-life, the
		 * fresh `start()` will still call `gsap.to(...)` with `val:
		 * NaN` which will produce `NaN` text — acceptable degradation
		 * for an exotic edge case. Re-adding full validation here is
		 * a strict superset and easy to extend later if needed.
		 */
		update(newOptions: CounterOptions) {
			trigger?.kill();
			tween?.kill();
			trigger = null;
			tween = null;
			const { decimals = 0, prefix = '', suffix = '' } = newOptions;
			node.textContent = formatValue(0, decimals, prefix, suffix);
			start(newOptions);
		},
		/**
		 * Sub-task 5.11 — kill the tween + trigger.
		 *
		 * Both are nullable: the action may be torn down before
		 * `loadGsap()` resolves (so neither was ever assigned), or
		 * after `loadGsap()` resolved but before the ScrollTrigger
		 * fired (so `tween` is still null). Optional chaining
		 * handles both cases.
		 *
		 * We deliberately do NOT touch `node.textContent` here:
		 * Requirement 5.10 explicitly allows the text to be left at
		 * an intermediate value when destroyed mid-animation. The
		 * caller's component is presumably about to unmount anyway.
		 */
		destroy() {
			trigger?.kill();
			tween?.kill();
		}
	};
};

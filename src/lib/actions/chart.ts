/**
 * Chart Svelte actions backed by GSAP + ScrollTrigger.
 *
 * ---------------------------------------------------------------------------
 * MIGRATION STATUS — GSAP refactor (Task 6)
 * ---------------------------------------------------------------------------
 *   • `animateBars`     — refactored from custom `requestAnimationFrame` +
 *                         `IntersectionObserver` to a single ScrollTrigger
 *                         that, on viewport entry, dispatches one
 *                         `gsap.to(bar, { height, delay: i * stagger })`
 *                         per `[data-bar]` descendant (sub-tasks 6.1–6.3).
 *
 *   • `animateProgress` — refactored from inline `style.transition =
 *                         'width ... cubic-bezier(...)'` to a ScrollTrigger
 *                         + `gsap.to(node, { width: target })` (sub-tasks
 *                         6.4–6.5). The native CSS transition assignment
 *                         is gone, so we no longer leak a `transition`
 *                         declaration on the element after the animation
 *                         completes.
 *
 *   • Both actions      — reduced-motion / SSR fast path leaves target
 *                         styles intact (sub-task 6.6, Requirements 6.5
 *                         / 6.8). `destroy()` kills every tween + trigger
 *                         (sub-task 6.7, Requirements 6.6 / 6.11).
 *
 * ---------------------------------------------------------------------------
 * ⚠ BREAKING CHANGE — TIME UNITS (Requirements 6.1, 6.7, 14.7)
 * ---------------------------------------------------------------------------
 * `delay`, `duration`, and (for `animateBars`) `stagger` are all now in
 * **SECONDS**, matching the GSAP convention. The previous `motion`-era
 * implementation used **milliseconds** for every time-based option:
 *
 *   // Before (motion / ms)                 // After (gsap / seconds)
 *   use:animateBars={{                      use:animateBars={{
 *     delay: 200, duration: 600,              delay: 0.2, duration: 0.6,
 *     stagger: 30                             stagger: 0.03
 *   }}                                      }}
 *
 *   use:animateProgress={{                  use:animateProgress={{
 *     delay: 300, duration: 800             delay: 0.3, duration: 0.8
 *   }}                                      }}
 *
 * Existing call sites that still pass millisecond values (e.g. the
 * dashboard page passes `delay: 200`) will be migrated to seconds in the
 * site-wide audit tracked by Task 11. Until that audit lands, callers
 * passing millisecond values produce wildly long tweens — the value is
 * forwarded verbatim to `gsap.to({ delay, duration })` with NO ms→s
 * conversion in this module.
 *
 * @module chart
 */
import type { Action } from 'svelte/action';
import type { GsapBundle } from '$lib/utils/gsap-client';
import { shouldAnimate, EASE, DURATION } from '$lib/utils/animation';
import { loadGsap } from '$lib/utils/gsap-client';

// Convenience aliases for the live ScrollTrigger instance and Tween
// returned by `gsap.to(...)`. Sourced from `GsapBundle` so the types
// stay in lock-step with the loader.
type ScrollTriggerInstance = ReturnType<GsapBundle['ScrollTrigger']['create']>;
type GsapTween = ReturnType<GsapBundle['gsap']['to']>;

// ===========================================================================
// animateBars
// ===========================================================================

/**
 * Options for the {@link animateBars} Svelte action.
 *
 * **Time units**: `delay`, `duration`, and `stagger` are in **SECONDS**
 * (GSAP convention). See the file-level breaking-change notice above for
 * the migration story from the previous millisecond-based API.
 */
export type AnimateBarsOptions = {
	/**
	 * Delay before the first bar starts tweening, in **seconds**, applied
	 * after the ScrollTrigger fires. Each subsequent bar is offset by
	 * `i * stagger` on top of this base delay.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ delay })` with no conversion.
	 *
	 * @default 0
	 */
	delay?: number;
	/**
	 * Length of each bar's grow tween, in **seconds**.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ duration })` with no conversion.
	 *
	 * @default DURATION.slow (0.6s)
	 */
	duration?: number;
	/**
	 * Time gap between each bar's tween start, in **seconds**. Bar `i`
	 * starts at `delay + i * stagger`.
	 *
	 * @default 0.03
	 */
	stagger?: number;
	/**
	 * GSAP ease NAME (string) used by every bar's tween. Any
	 * GSAP-recognised ease string is valid — see
	 * https://gsap.com/docs/v3/Eases/ for the full list.
	 *
	 * @default EASE.out (`'power3.out'`)
	 */
	ease?: string;
};

/**
 * `animateBars` — animate the `height` of every `[data-bar]` descendant
 * of `node` from `'0%'` to its declared target height, staggered by
 * insertion order. Triggered by viewport entry via ScrollTrigger.
 *
 * Architecture (sub-tasks 6.1–6.3, 6.6, 6.7):
 *   1. **Snapshot** — at mount, query every `[data-bar]` descendant and
 *      capture each bar's `style.height` as the tween target. The
 *      snapshot is taken synchronously BEFORE the bars are reset to
 *      `'0%'`, so the original target is never lost.
 *   2. **Reduced-motion / SSR** — leave target heights intact, return
 *      a no-op destroy. Per Requirement 6.5: "WHEN action `animateBars`
 *      mount dan `shouldAnimate() === false` THEN sistem SHALL tidak
 *      mengubah `style.height` (biarkan target)."
 *   3. **Initial state** — set every bar to `'2px'` (NOT `'0%'`) so a
 *      hairline of the bar remains visible during the load window
 *      while `loadGsap()` resolves. This matches the previous impl's
 *      behaviour and prevents the chart from looking empty during the
 *      first paint.
 *   4. **ScrollTrigger** — one trigger on the container `node`, with
 *      `once: true`. On viewport entry we iterate the bars and dispatch
 *      one `gsap.to(bar, { height: targets[i], duration, delay: base +
 *      i * stagger, ease })` per bar. Per-bar tweens (rather than a
 *      single multi-target tween with the `stagger` option) give us
 *      individual handles in the `tweens` array for `destroy()`.
 *   5. **Cleanup** — `destroy()` kills the trigger and every tracked
 *      tween. Safe pre-load: trigger and tween array stay empty if the
 *      action is torn down before GSAP finishes loading.
 *
 * Per Requirements 6.1–6.6.
 */
export const animateBars: Action<HTMLElement, AnimateBarsOptions | undefined> = (
	node,
	options = {}
) => {
	// Snapshot bars + their target heights synchronously at mount, BEFORE
	// any early-return path. The snapshot is shared between the
	// reduced-motion fast path (which leaves them alone) and the
	// animation path (which reads them as tween targets). Querying at
	// mount also matches the legacy contract: bars added to the DOM
	// after mount are NOT animated.
	const bars = Array.from(node.querySelectorAll<HTMLElement>('[data-bar]'));
	const targets = bars.map((bar) => bar.style.height);

	// Reduced-motion / SSR guard (sub-task 6.6, Requirement 6.5).
	//
	// Critically: do NOT mutate `bar.style.height` here. The bars must
	// remain at their author-declared target heights so the chart is
	// visible immediately for users with `prefers-reduced-motion: reduce`
	// — the alternative (collapse to '0%' and skip the tween) would
	// leave the chart empty forever, which is worse than no animation.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { delay = 0, duration = DURATION.slow, stagger = 0.03, ease = EASE.out } = options;

	// Set initial state to a 2px hairline (Requirement 6.2, "set ke
	// '0%' (atau '2px')"). We pick `'2px'` over `'0%'` so each bar
	// remains visible during the brief window between mount and the
	// ScrollTrigger firing — a fully collapsed bar can look like a
	// rendering bug while GSAP loads. The tween then grows each bar
	// from this 2px baseline back up to its captured target height.
	for (const bar of bars) bar.style.height = '2px';

	// Track the trigger and every per-bar tween so destroy() can kill
	// them. Both stay empty/null if the action is torn down before
	// GSAP finishes loading.
	let trigger: ScrollTriggerInstance | null = null;
	const tweens: GsapTween[] = [];

	loadGsap().then((bundle) => {
		// `loadGsap()` returns null in SSR (defence-in-depth — the
		// outer `typeof window` guard already filtered SSR) and
		// re-throws on import failure, in which case the .then never
		// runs. Either way: graceful no-op.
		if (!bundle) return;
		const { gsap, ScrollTrigger } = bundle;

		// Single ScrollTrigger on the container. We deliberately do
		// NOT create one trigger per bar:
		//   • Bars are visually grouped — a single viewport entry
		//     should kick off the entire stagger.
		//   • One trigger means one cleanup site in `destroy()`.
		//
		// `once: true` matches the design contract (Requirement 6.3):
		// bars never re-grow on scroll back. ScrollTrigger auto-kills
		// the trigger after `onEnter` completes.
		trigger = ScrollTrigger.create({
			trigger: node,
			// 20% past the viewport top edge — slightly more eager than
			// the standard reveal threshold (10%) because charts tend
			// to live below tall hero sections and benefit from
			// triggering as soon as a meaningful slice is visible.
			start: 'top bottom-=20%',
			once: true,
			onEnter: () => {
				bars.forEach((bar, i) => {
					const tween = gsap.to(bar, {
						height: targets[i],
						duration,
						delay: delay + i * stagger,
						ease
					});
					tweens.push(tween);
				});
			}
		});
	});

	return {
		/**
		 * Sub-task 6.7 — kill the trigger + every tracked tween.
		 *
		 * Both the trigger and every entry in `tweens` may be missing
		 * at destroy time (e.g. action torn down before `loadGsap()`
		 * resolved, or before the ScrollTrigger fired). Optional
		 * chaining + iterating an empty array handle both cases.
		 *
		 * We deliberately do NOT touch `bar.style.height` here:
		 * matching the `counter` action's contract, mid-animation
		 * destroy may leave bars at intermediate heights — the
		 * caller's component is presumably about to unmount.
		 */
		destroy() {
			trigger?.kill();
			for (const tween of tweens) tween.kill();
			tweens.length = 0;
		}
	};
};

// ===========================================================================
// animateProgress
// ===========================================================================

/**
 * Options for the {@link animateProgress} Svelte action.
 *
 * **Time units**: `delay` and `duration` are in **SECONDS** (GSAP
 * convention). See the file-level breaking-change notice above.
 */
export type AnimateProgressOptions = {
	/**
	 * Delay before the width tween starts, in **seconds**, applied
	 * after the ScrollTrigger fires.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ delay })` with no conversion.
	 *
	 * @default 0
	 */
	delay?: number;
	/**
	 * Length of the width tween, in **seconds**.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ duration })` with no conversion.
	 *
	 * @default DURATION.verySlow (0.8s)
	 */
	duration?: number;
	/**
	 * GSAP ease NAME (string) used by the width tween.
	 *
	 * @default EASE.out (`'power3.out'`)
	 */
	ease?: string;
};

/**
 * `animateProgress` — animate `node.style.width` from `'0%'` to its
 * declared target width on viewport entry.
 *
 * Architecture (sub-tasks 6.4–6.7):
 *   1. **Snapshot** — capture `node.style.width` at mount as the tween
 *      target, BEFORE we collapse the node to `'0%'`. The captured
 *      value is whatever the author wrote into the `style="width: ..."`
 *      attribute (e.g. `'42%'`, `'120px'`).
 *   2. **Reduced-motion / SSR** — leave the target width intact, return
 *      a no-op destroy. Per Requirement 6.6 / 6.10: progress bars must
 *      already be at their final width for users with reduced-motion.
 *   3. **Initial state** — collapse `node.style.width = '0%'` so the
 *      bar starts empty during the load window.
 *   4. **GSAP tween** — replaces the previous inline
 *      `style.transition = 'width ... cubic-bezier(...)'` approach
 *      (sub-task 6.5). Going through `gsap.to(node, { width })` means:
 *        • The tween is killable from `destroy()` — the previous CSS
 *          transition could not be cancelled mid-flight.
 *        • No leftover `transition` declaration sits on the element
 *          after the animation completes.
 *        • The ease is a GSAP ease string, so it composes with the
 *          rest of the codebase's `EASE.*` token system.
 *   5. **Cleanup** — `destroy()` kills the trigger + tween. Safe to
 *      call before GSAP loads.
 *
 * Per Requirements 6.7–6.11.
 */
export const animateProgress: Action<HTMLElement, AnimateProgressOptions | undefined> = (
	node,
	options = {}
) => {
	// Snapshot the target width synchronously at mount, BEFORE any
	// early-return path. Reading it here (rather than inside the
	// `loadGsap().then(...)` callback) matters because:
	//   • The author-declared target is on `style.width`. If a parent
	//     reactivity update runs between mount and the GSAP load
	//     resolving, the inline style could already have been mutated,
	//     and we'd snapshot a stale or empty value.
	//   • The reduced-motion path ALSO uses this captured target —
	//     it's read implicitly via the no-op (we don't touch
	//     `style.width` at all, so the original target stays in
	//     place).
	const targetWidth = node.style.width;

	// Reduced-motion / SSR guard (sub-task 6.6, Requirements 6.6, 6.10).
	//
	// Same reasoning as `animateBars`: do NOT collapse to '0%' here,
	// because then the bar would never grow back. Leave `style.width`
	// at the captured target so the bar renders at full final width
	// immediately for users with `prefers-reduced-motion: reduce`.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { delay = 0, duration = DURATION.verySlow, ease = EASE.out } = options;

	// Initial state — collapse to 0%. The CSS unit on the target
	// (`'42%'`, `'120px'`) doesn't have to match the initial unit:
	// GSAP handles unit interpolation between `'0%'` and the captured
	// target value at tween time.
	node.style.width = '0%';

	// Track the trigger and tween so destroy() can kill them.
	let trigger: ScrollTriggerInstance | null = null;
	let tween: GsapTween | null = null;

	loadGsap().then((bundle) => {
		if (!bundle) return;
		const { gsap, ScrollTrigger } = bundle;

		trigger = ScrollTrigger.create({
			trigger: node,
			// Progress bars are typically inside cards/list items that
			// are already mostly visible by the time the user scrolls
			// to them — fire as soon as the top edge crosses the
			// viewport bottom, matching the previous IntersectionObserver
			// threshold of 0.5 conceptually (don't wait for the whole
			// card to be visible).
			start: 'top bottom-=10%',
			once: true,
			onEnter: () => {
				tween = gsap.to(node, {
					width: targetWidth,
					duration,
					delay,
					ease
				});
			}
		});
	});

	return {
		/**
		 * Sub-task 6.7 — kill the trigger + tween.
		 *
		 * Both may be `null` at destroy time (action torn down before
		 * GSAP loaded, or before the trigger fired). Optional chaining
		 * handles both cases.
		 */
		destroy() {
			trigger?.kill();
			tween?.kill();
		}
	};
};

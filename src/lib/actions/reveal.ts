/**
 * Reveal-on-scroll Svelte actions backed by GSAP + ScrollTrigger.
 *
 * ---------------------------------------------------------------------------
 * ⚠ BREAKING CHANGE — TIME UNITS (Requirements 3.3, 3.5, 14.7)
 * ---------------------------------------------------------------------------
 * As of the GSAP migration, **all time-based options on `reveal` and
 * `revealStagger` are expressed in SECONDS**, matching the GSAP convention.
 *
 * The previous `motion`-based implementation accepted these values in
 * **milliseconds**. Every existing call site that passed millisecond values
 * MUST be migrated:
 *
 *   // Before (motion / ms)              // After (gsap / seconds)
 *   use:reveal={{ delay: 200 }}     →    use:reveal={{ delay: 0.2 }}
 *   use:reveal={{ duration: 600 }}  →    use:reveal={{ duration: 0.6 }}
 *   use:revealStagger={{ stagger: 80 }} →
 *                                   use:revealStagger={{ stagger: 0.08 }}
 *
 * The site-wide audit and migration of these call sites is tracked by
 * Task 11 in `tasks.md`. Until that audit lands, any caller that still
 * passes a millisecond value (e.g. `delay: 200`) will produce a 200-second
 * delay — the value is forwarded verbatim to `gsap.to({ delay, duration })`
 * with NO ms→s conversion in this module.
 *
 * @module reveal
 */
import type { Action } from 'svelte/action';
import type { GsapBundle } from '$lib/utils/gsap-client';
import { shouldAnimate, EASE, DURATION, STAGGER } from '$lib/utils/animation';
import { loadGsap } from '$lib/utils/gsap-client';

// Convenience aliases for the live ScrollTrigger instance and Tween
// returned by `gsap.to(...)`. Sourced from `GsapBundle` so the types
// stay in lock-step with the loader.
type ScrollTriggerInstance = ReturnType<GsapBundle['ScrollTrigger']['create']>;
type GsapTween = ReturnType<GsapBundle['gsap']['to']>;

/**
 * Options for the {@link reveal} Svelte action.
 *
 * **Time units**: `delay` and `duration` are in **SECONDS** (GSAP convention).
 * This is a breaking change from the previous `motion`-based implementation
 * which used milliseconds — see the file-level JSDoc warning above.
 */
export type RevealOptions = {
	/**
	 * Delay before the reveal tween starts, in **seconds** after the
	 * ScrollTrigger fires.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ delay })` with no conversion.
	 *
	 * @default 0
	 */
	delay?: number;
	/**
	 * Length of the reveal tween, in **seconds**.
	 *
	 * ⚠ **BREAKING from ms in the previous motion impl.** Forwarded
	 * directly to `gsap.to({ duration })` with no conversion.
	 *
	 * @default DURATION.slow (0.6s)
	 */
	duration?: number;
	/**
	 * Vertical offset (in **pixels**) the node animates from. The node
	 * starts at `translateY(y)` and tweens to `translateY(0)`.
	 *
	 * @default 24
	 */
	y?: number;
	/**
	 * Horizontal offset (in **pixels**) the node animates from. The node
	 * starts at `translateX(x)` and tweens to `translateX(0)`.
	 *
	 * @default 0
	 */
	x?: number;
	/**
	 * Initial scale factor (unitless multiplier) the node animates from.
	 * `1` means no scale animation; `0.95` would fade in from 95% size.
	 *
	 * @default 1
	 */
	scale?: number;
	/**
	 * Whether the ScrollTrigger fires only once. When `true`, the tween
	 * plays on first viewport entry and the trigger then auto-kills.
	 * Mutually exclusive with `scrub` — when `scrub` is truthy this flag
	 * is ignored so the trigger remains alive for scrubbing.
	 *
	 * @default true
	 */
	once?: boolean;
	/**
	 * How far into the viewport (as a fraction `0..1` of viewport height)
	 * the trigger fires. `0.15` means fire when 15% of the viewport has
	 * been crossed past the element's top edge.
	 *
	 * @default 0.15
	 */
	amount?: number;
	/**
	 * ScrollTrigger scrub: tie tween progress to scroll position.
	 * - `false` — play once on enter (default).
	 * - `true` — instant scrub (tween progress equals scroll progress).
	 * - `number` — smoothed scrub with the given catch-up time in
	 *   **seconds** (e.g. `0.5`).
	 *
	 * When truthy, `once` is ignored.
	 *
	 * @default false
	 */
	scrub?: boolean | number;
};

/**
 * `reveal` — fade/slide-in on scroll, powered by GSAP + ScrollTrigger.
 *
 * Migrated from `motion`'s `inView`/`animate` to `loadGsap()` + a
 * `ScrollTrigger` instance (sub-task 3.1, foundational rewrite for
 * Task 3 of the GSAP migration spec). Subsequent sub-tasks refine:
 *   3.2 synchronous initial style (FOUC prevention) — DONE
 *   3.3 ScrollTrigger options (start position, once, scrub)
 *   3.4 tween details (clearProps, overwrite)
 *   3.5 unit standardization (delay/duration in seconds)
 *   3.6 destroy() cleanup
 *   3.7 revealStagger refactor
 *   3.8 SSR / reduced-motion no-op guards
 *   3.9 exported type definitions
 *
 * **Breaking change**: `delay` and `duration` are now in **seconds**
 * (GSAP convention), not milliseconds.
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options = {}) => {
	// Reduced-motion / SSR guard — leave the node in its default visible
	// state. Refined further in sub-task 3.8.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		delay = 0,
		duration = DURATION.slow,
		y = 24,
		x = 0,
		scale = 1,
		once = true,
		amount = 0.15,
		scrub = false
	} = options;

	// Synchronous initial state (sub-task 3.2, Requirement 3.14).
	//
	// Set raw `node.style` BEFORE `loadGsap()` is awaited so the element
	// is committed to its hidden/offset state in the same task in which
	// the action mounts. This prevents FOUC: without this, the element
	// would render in its natural visible state for at least one frame
	// while the dynamic `import('gsap')` chunk loads, producing a flash
	// before the reveal tween starts.
	//
	// We use `node.style` directly (not `gsap.set`) precisely because
	// GSAP is not loaded yet — synchrony is the whole point. `willChange`
	// is added here as a paint-optimization hint and cleared inside the
	// reveal tween via `clearProps: 'willChange'` (sub-task 3.4) so the
	// hint does not linger after the animation completes.
	node.style.opacity = '0';
	if (y !== 0 || x !== 0 || scale !== 1) {
		node.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
	}
	node.style.willChange = 'transform, opacity';

	// Track the trigger and tween so destroy() can kill them. Tween is
	// (re)assigned inside ScrollTrigger.onEnter; trigger is assigned
	// once `loadGsap()` resolves. Both may be `null` at destroy time
	// (e.g. action torn down before GSAP finished loading).
	let trigger: ScrollTriggerInstance | null = null;
	let tween: GsapTween | null = null;

	loadGsap().then((bundle) => {
		if (!bundle) return;
		const { gsap, ScrollTrigger } = bundle;

		// Sub-task 3.3 — ScrollTrigger configuration.
		//
		// `start` — `top bottom-=${amount * 100}%` means: fire when the
		// top of the element is `amount` (0..1) of the viewport height
		// past the viewport bottom edge. With the default amount=0.15,
		// the trigger fires once 15% of the way into the viewport.
		//
		// `once` vs `scrub` interplay (Requirements 3.6, 3.7) —
		// these two options are mutually exclusive in practice:
		//
		//   • `once: true` makes ScrollTrigger fire `onEnter` exactly
		//     once and then auto-kill itself. The reveal tween plays
		//     forward and stays at its final state forever.
		//   • `scrub: true | number` ties tween progress directly to
		//     the scroll position — the trigger MUST remain alive for
		//     the lifetime of the action, otherwise scrolling back
		//     would not rewind the tween.
		//
		// If a caller passes both (`once: true, scrub: 0.5`), `scrub`
		// wins because `once && !scrub` evaluates to `false` whenever
		// `scrub` is truthy (number > 0 or `true`). This matches the
		// design contract in Requirement 3.7: scrub mode disables the
		// once short-circuit so the trigger stays scrubbable.
		const startPos = `top bottom-=${amount * 100}%`;

		trigger = ScrollTrigger.create({
			trigger: node,
			start: startPos,
			once: once && !scrub,
			scrub,
			onEnter: () => {
				tween = gsap.to(node, {
					opacity: 1,
					x: 0,
					y: 0,
					scale: 1,
					duration,
					delay,
					ease: EASE.out,
					clearProps: 'willChange',
					overwrite: 'auto'
				});
			}
		});
	});

	return {
		destroy() {
			trigger?.kill();
			tween?.kill();
		}
	};
};

// ---------------------------------------------------------------------------
// `revealStagger` — GSAP + ScrollTrigger refactor (sub-task 3.7).
//
// Mirrors the `reveal` pattern:
//   1. Synchronous initial style on each child (FOUC prevention).
//   2. Defer GSAP load via `loadGsap()`.
//   3. ONE ScrollTrigger on the container `node` (not per child) with
//      `once: true` by default — heterogeneous children share a single
//      viewport entry trigger.
//   4. In `onEnter`, iterate children and run a per-child `gsap.to` with
//      `delay: i * stagger` (plus the base `delay`). We do NOT use the
//      `gsap.to(targets, { ..., stagger })` form because per-child trigger
//      semantics + heterogeneous children make per-tween control simpler.
//
// Per Requirements 3.10–3.12, 3.14.
// ---------------------------------------------------------------------------

/**
 * Options for the {@link revealStagger} Svelte action.
 *
 * Same shape as {@link RevealOptions} sans `scale`, plus `stagger` (in
 * **seconds**) controlling the per-child offset.
 *
 * **Time units**: `delay`, `duration`, and `stagger` are all in
 * **SECONDS** (GSAP convention) — see file-level JSDoc warning above.
 */
export type RevealStaggerOptions = {
	/**
	 * Base delay applied before the first child's tween starts, in
	 * **seconds**. Each child `i` then starts at `delay + i * stagger`.
	 *
	 * @default 0
	 */
	delay?: number;
	/**
	 * Per-child tween length, in **seconds**.
	 *
	 * @default DURATION.slow (0.6s)
	 */
	duration?: number;
	/**
	 * Vertical offset (in **pixels**) each child animates from. Children
	 * start at `translateY(y)` and tween to `translateY(0)`.
	 *
	 * @default 24
	 */
	y?: number;
	/**
	 * Horizontal offset (in **pixels**) each child animates from.
	 *
	 * @default 0
	 */
	x?: number;
	/**
	 * Time gap between each child's tween start, in **seconds**. Child
	 * `i` starts at `delay + i * stagger`.
	 *
	 * @default STAGGER.normal (0.07s)
	 */
	stagger?: number;
	/**
	 * Whether the container's ScrollTrigger fires only once. When `true`,
	 * the staggered reveal plays on first viewport entry and the trigger
	 * then auto-kills.
	 *
	 * @default true
	 */
	once?: boolean;
	/**
	 * How far into the viewport (as a fraction `0..1` of viewport height)
	 * the trigger fires.
	 *
	 * @default 0.15
	 */
	amount?: number;
};

/**
 * `revealStagger` — fade/slide-in each child of `node` on scroll, with a
 * per-child time offset. Powered by GSAP + ScrollTrigger.
 *
 * Pattern (sub-task 3.7):
 *   • Synchronous initial style applied to each child via raw
 *     `child.style` BEFORE GSAP loads (FOUC prevention, mirrors `reveal`).
 *   • One ScrollTrigger on the container `node` — children share the
 *     same viewport entry signal.
 *   • Per-child tween created in `onEnter` with `delay: base + i * stagger`
 *     so each child fades in offset from the previous.
 *   • `destroy()` kills the trigger and every per-child tween via
 *     `gsap.killTweensOf(child)` (covers any in-flight tween on the child,
 *     even ones not tracked in our array — defensive cleanup).
 *
 * **Breaking change**: `delay`, `duration`, and `stagger` are now in
 * **seconds** (GSAP convention), not milliseconds. See file-level JSDoc.
 */
export const revealStagger: Action<HTMLElement, RevealStaggerOptions | undefined> = (
	node,
	options = {}
) => {
	// Reduced-motion / SSR guard — leave children in their default visible
	// state. Refined further in sub-task 3.8.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		delay = 0,
		duration = DURATION.slow,
		y = 24,
		x = 0,
		stagger = STAGGER.normal,
		once = true,
		amount = 0.15
	} = options;

	// Synchronous initial state on each child (Requirement 3.14).
	//
	// Snapshot children at mount time. Using `Array.from(node.children)`
	// (HTMLCollection → array) so that subsequent additions/removals do
	// not silently change the set we're animating. If the consumer mounts
	// children dynamically AFTER the action initializes, those new
	// children will not be hidden/animated — that matches `reveal`'s
	// single-target contract and is the simplest behavior to reason
	// about.
	const children = Array.from(node.children) as HTMLElement[];
	for (const child of children) {
		child.style.opacity = '0';
		if (y !== 0 || x !== 0) {
			child.style.transform = `translate(${x}px, ${y}px)`;
		}
		child.style.willChange = 'transform, opacity';
	}

	// Track the trigger and every per-child tween so destroy() can kill
	// them. Tweens are pushed inside ScrollTrigger.onEnter; trigger is
	// assigned once `loadGsap()` resolves. Array stays empty if the
	// action is torn down before GSAP finishes loading. We also retain a
	// reference to the loaded `gsap` object so destroy() can call
	// `gsap.killTweensOf(child)` for defensive cleanup of any out-of-band
	// tween that may target the child outside of our tracked array.
	let trigger: ScrollTriggerInstance | null = null;
	let gsapRef: GsapBundle['gsap'] | null = null;
	const tweens: GsapTween[] = [];

	loadGsap().then((bundle) => {
		if (!bundle) return;
		const { gsap, ScrollTrigger } = bundle;
		gsapRef = gsap;

		// Same `start` formula as `reveal` — fire when `amount` of the
		// container has crossed past the viewport bottom. Container-level
		// trigger ensures the staggered sequence is anchored to the group,
		// not to each child individually (which would be visually choppy
		// for heterogeneous children of differing heights).
		const startPos = `top bottom-=${amount * 100}%`;

		trigger = ScrollTrigger.create({
			trigger: node,
			start: startPos,
			once,
			onEnter: () => {
				children.forEach((child, i) => {
					const tween = gsap.to(child, {
						opacity: 1,
						x: 0,
						y: 0,
						duration,
						delay: delay + i * stagger,
						ease: EASE.out,
						clearProps: 'willChange'
					});
					tweens.push(tween);
				});
			}
		});
	});

	return {
		destroy() {
			trigger?.kill();
			// Iterate tracked tweens (per task 3.7: "Track child tweens
			// in an array so destroy can iterate") and kill each. Then,
			// per the same task, additionally call `gsap.killTweensOf(child)`
			// for each child to scrub any tween that may have been queued
			// but not yet pushed into our array — for example, a tween
			// scheduled by `gsap.to()` whose return value never reached
			// `tweens.push()` because the action was destroyed mid-loop.
			for (const tween of tweens) tween.kill();
			tweens.length = 0;
			if (gsapRef) {
				for (const child of children) gsapRef.killTweensOf(child);
			}
		}
	};
};

/**
 * Hover Svelte actions.
 *
 * ---------------------------------------------------------------------------
 * MIGRATION STATUS — GSAP refactor (Task 4)
 * ---------------------------------------------------------------------------
 *   • `hoverLift`   — fully refactored to GSAP via `loadGsap()`.
 *                       4.1 ✓ One-time `quickTo` setter creation (`yTo`,
 *                           `scaleTo`) inside the loader resolver.
 *                       4.2 ✓ `onMouseEnter`: invokes the cached setters
 *                           with `y` / `scale` and fires a separate
 *                           `gsap.to(node, { boxShadow, ... })` for the
 *                           glow (boxShadow can't be driven by quickTo
 *                           because the value is a string, not a number).
 *                       4.3 ✓ `onMouseLeave`: inverse — `yTo(0)`,
 *                           `scaleTo(1)`, and a slower (`duration * 1.4`)
 *                           shadow tween back to transparent.
 *                       4.4 ✓ `destroy()`: removes both listeners and
 *                           calls `gsap.killTweensOf(node)` to scrub any
 *                           in-flight tween (lift + scale + shadow).
 *                       4.5 ✓ `duration` in seconds (GSAP convention).
 *                       4.7 ✓ No-op when `shouldAnimate() === false` —
 *                           early return before any listener attaches.
 *
 *   • `hoverBorder` — refactored to GSAP via `loadGsap()` (sub-task 4.6).
 *                       Mirrors the `hoverLift` listener pattern:
 *                       enter tweens `borderColor` to `options.color`,
 *                       leave tweens it back to `var(--color-border)` at
 *                       `duration * 1.4`. Both via `gsap.to(node, …)`
 *                       with `EASE.smooth`. `destroy()` removes both
 *                       listeners and calls `gsap.killTweensOf(node)`.
 *                       (NB: we intentionally don't use `quickTo` here
 *                       because `borderColor` is a string property and
 *                       quickTo only supports numeric tweens.)
 *
 * ---------------------------------------------------------------------------
 * BREAKING CHANGE — TIME UNITS (Requirement 4.5, Task 11 audit)
 * ---------------------------------------------------------------------------
 * `duration` is in **SECONDS** (GSAP convention). Existing call sites that
 * pass milliseconds (e.g. `duration: 200`) will be migrated in Task 11.
 */
import type { Action } from 'svelte/action';
import type { GsapBundle } from '$lib/utils/gsap-client';
import { shouldAnimate, EASE } from '$lib/utils/animation';
import { loadGsap } from '$lib/utils/gsap-client';

/**
 * Type of a `gsap.quickTo` setter — the high-performance, reusable
 * tween invoker we create ONCE per `hoverLift` mount and call many
 * times from the mouseenter / mouseleave handlers (sub-tasks 4.2 /
 * 4.3). Sourced from `GsapBundle` so the types stay in lock-step
 * with the loader.
 */
type QuickToFunc = ReturnType<GsapBundle['gsap']['quickTo']>;

/**
 * Options for the {@link hoverLift} Svelte action.
 *
 * **Time units**: `duration` is in **SECONDS** (GSAP convention) — see
 * file-level breaking-change notice above.
 */
export type HoverLiftOptions = {
	/**
	 * Vertical offset (in **pixels**) the node lifts to on hover. Negative
	 * lifts the node up.
	 *
	 * @default -4
	 */
	y?: number;
	/**
	 * Scale factor on hover. `1` disables scale animation.
	 *
	 * @default 1
	 */
	scale?: number;
	/**
	 * Length of the hover-in tween, in **seconds**. Hover-out runs
	 * slightly slower (sub-task 4.3 will set the leave duration to
	 * `duration * 1.4`).
	 *
	 * @default 0.2
	 */
	duration?: number;
	/**
	 * CSS color used for the glow `boxShadow` on hover. Accepts any
	 * valid CSS color or `var(--…)` reference.
	 *
	 * @default 'var(--color-primary)'
	 */
	glowColor?: string;
	/**
	 * Glow intensity in `0..1`. Reserved for the boxShadow alpha
	 * channel applied by the mouseenter handler in sub-task 4.2.
	 *
	 * @default 0.2
	 */
	glowIntensity?: number;
};

/**
 * `hoverLift` — translateY + scale + glow on hover, powered by GSAP
 * `quickTo` setters (numeric props) and a per-event `gsap.to()` for
 * the `boxShadow` glow (string prop, not quickTo-eligible).
 *
 * Sub-tasks 4.1 → 4.4 wire up:
 *   - `loadGsap()` resolver creates `yTo` / `scaleTo` setters ONCE.
 *   - `onMouseEnter` / `onMouseLeave` invoke those setters and fire a
 *     small `boxShadow` tween for the glow / fade-out.
 *   - `destroy()` removes both listeners and calls
 *     `gsap.killTweensOf(node)` to cancel any in-flight tween (lift,
 *     scale, or shadow) created against the node.
 */
export const hoverLift: Action<HTMLElement, HoverLiftOptions | undefined> = (
	node,
	options = {}
) => {
	// Reduced-motion / SSR guard — Requirement 4.10 / sub-task 4.7.
	// Returning an empty object short-circuits the action: no listeners
	// attached, no GSAP load, no destroy needed.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		y = -4,
		scale = 1,
		duration = 0.2,
		glowColor = 'var(--color-primary)',
		glowIntensity = 0.2
	} = options;

	// Pre-compute the boxShadow alpha as a 2-character hex (Requirement
	// 4.3). `glowIntensity` is in `0..1`; we clamp before multiplying
	// by 255 so a stray `2` or `-1` from a caller can't yield a bogus
	// hex value. The result is appended to whatever color string the
	// caller supplied (e.g. `var(--color-primary)`) — modern browsers
	// support 8-digit hex on `boxShadow` even when the rest of the
	// color comes from a CSS variable, but we also accept normal hex
	// or `rgb(...)` colors with the same suffix shape (`...XX`).
	const clampedIntensity = Math.max(0, Math.min(1, glowIntensity));
	const alphaHex = Math.round(clampedIntensity * 255)
		.toString(16)
		.padStart(2, '0');
	const glowShadow = `0 8px 32px -8px ${glowColor}${alphaHex}`;

	// Captured GSAP core reference. Stored at action scope so the
	// `destroy()` returned below can call `gsap.killTweensOf(node)`
	// (sub-task 4.4) regardless of whether the loader has resolved
	// yet — if it hasn't, there are no tweens to kill anyway.
	let gsapRef: GsapBundle['gsap'] | null = null;

	// quickTo setters created ONCE per action mount inside the
	// `loadGsap().then(...)` resolver below. They are declared at this
	// outer scope so `onMouseEnter` / `onMouseLeave` (defined inside
	// the resolver) can close over them, and so the foundational
	// scaffold remains clear about the lifecycle.
	let yTo: QuickToFunc | null = null;
	let scaleTo: QuickToFunc | null = null;

	// Listener references — captured at outer scope so `destroy()`
	// (sub-task 4.4) can pass the *exact same* function reference to
	// `removeEventListener`. They're populated inside the loader
	// resolver, so they may still be `null` at the moment `destroy()`
	// runs (e.g. component unmounted before the dynamic import
	// resolved). The destroy path handles that case gracefully.
	let onMouseEnter: (() => void) | null = null;
	let onMouseLeave: (() => void) | null = null;

	loadGsap().then((bundle) => {
		if (!bundle) return;
		const { gsap } = bundle;
		gsapRef = gsap;

		// Sub-task 4.1 — create both setters with the same `duration` /
		// `ease` config. `EASE.smooth` is `power1.out` (see
		// `$lib/utils/animation`), the design-spec'd ease for hover.
		// `gsap.quickTo(node, 'y', …)` returns a function that can be
		// invoked many times with a target value (e.g. `yTo(-4)`) to
		// fire a tween with near-zero per-call allocation — critical
		// for hover paths that may fire dozens of times per second.
		yTo = gsap.quickTo(node, 'y', { duration, ease: EASE.smooth });
		scaleTo = gsap.quickTo(node, 'scale', { duration, ease: EASE.smooth });

		// Sub-task 4.2 — mouseenter handler. Drive the cached numeric
		// setters at the configured target values, and tween the
		// boxShadow separately because it's a string property
		// (`quickTo` only handles numeric tweens). The shadow tween
		// reuses `EASE.smooth` for visual consistency with the lift.
		onMouseEnter = () => {
			yTo?.(y);
			// Skip the scale setter when the caller opted out (default
			// `scale: 1` means no scale animation per Requirement 4.1)
			// to avoid an unnecessary identity tween.
			if (scale !== 1) scaleTo?.(scale);
			gsap.to(node, {
				boxShadow: glowShadow,
				duration,
				ease: EASE.smooth
			});
		};

		// Sub-task 4.3 — mouseleave handler. Inverse of mouseenter:
		// release the lift / scale and tween the shadow back to
		// transparent. Per Requirement 4.4, the leave shadow tween
		// runs at `duration * 1.4` (slightly slower than the enter)
		// for a visually pleasing settle.
		onMouseLeave = () => {
			yTo?.(0);
			if (scale !== 1) scaleTo?.(1);
			gsap.to(node, {
				boxShadow: '0 0 0 0 transparent',
				duration: duration * 1.4,
				ease: EASE.smooth
			});
		};

		node.addEventListener('mouseenter', onMouseEnter);
		node.addEventListener('mouseleave', onMouseLeave);
	});

	// Sub-task 4.4 — cleanup. The destroy path must be safe even when
	// the dynamic `loadGsap()` call hasn't resolved yet (component
	// torn down before GSAP loaded). All three captured references
	// are nullable, so we guard each one before touching it.
	return {
		destroy() {
			if (onMouseEnter) node.removeEventListener('mouseenter', onMouseEnter);
			if (onMouseLeave) node.removeEventListener('mouseleave', onMouseLeave);
			// Cancel any in-flight tween created against this node —
			// covers the `yTo`/`scaleTo` quickTo tweens AND the
			// boxShadow tween fired by mouseenter / mouseleave. If
			// gsap never finished loading, there are no tweens to
			// kill, so the guard is purely defensive.
			gsapRef?.killTweensOf(node);
		}
	};
};

// ---------------------------------------------------------------------------
// `hoverBorder` — refactored to GSAP (sub-task 4.6). Same listener
// pattern as `hoverLift` but with a single string-valued tween target
// (`borderColor`), so we use `gsap.to(...)` directly rather than
// `quickTo` (which only handles numeric properties).
// ---------------------------------------------------------------------------

/**
 * Options for the {@link hoverBorder} Svelte action.
 *
 * **Time units**: `duration` is in **SECONDS** (GSAP convention) — see
 * file-level breaking-change notice above.
 *
 * Defaults match Requirement 4.8 (`color='var(--color-primary)'`,
 * `duration=0.2`).
 */
export type HoverBorderOptions = {
	/**
	 * CSS color the border tweens to on `mouseenter`. Accepts any
	 * valid CSS color string or `var(--…)` reference. On
	 * `mouseleave` the border returns to `var(--color-border)`
	 * (the design-system neutral border token), regardless of the
	 * value here.
	 *
	 * @default 'var(--color-primary)'
	 */
	color?: string;
	/**
	 * Length of the hover-in tween, in **seconds**. The hover-out
	 * runs slightly slower at `duration * 1.4` (Requirement 4.9) for
	 * a visually pleasing settle, mirroring `hoverLift`.
	 *
	 * @default 0.2
	 */
	duration?: number;
};

/**
 * `hoverBorder` — tweens `borderColor` between `options.color` (enter)
 * and `var(--color-border)` (leave) on hover, powered by GSAP via the
 * shared `loadGsap()` singleton loader. Mirrors the `hoverLift`
 * listener / cleanup pattern from sub-tasks 4.1–4.4 / 4.7.
 *
 * Per Requirements 4.8, 4.9, 4.10:
 *   - Default `color='var(--color-primary)'`, `duration=0.2`.
 *   - Enter tween fires at `duration`; leave at `duration * 1.4`.
 *   - `destroy()` removes both listeners and kills any in-flight tween
 *     against `node` via `gsap.killTweensOf(node)`.
 *
 * No-op (returns `{}`) when `shouldAnimate()` is false (reduced motion)
 * or in SSR — Requirement 4.10 / 11.x parity with `hoverLift`.
 */
export const hoverBorder: Action<HTMLElement, HoverBorderOptions | undefined> = (
	node,
	options = {}
) => {
	// Reduced-motion / SSR guard — Requirement 4.10 / parity with
	// `hoverLift`. Returning an empty object short-circuits the
	// action: no listeners attached, no GSAP load, no destroy
	// needed.
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { color = 'var(--color-primary)', duration = 0.2 } = options;

	// Captured GSAP core reference. Stored at action scope so the
	// `destroy()` returned below can call `gsap.killTweensOf(node)`
	// regardless of whether the loader has resolved yet — if it
	// hasn't, there are no tweens to kill anyway.
	let gsapRef: GsapBundle['gsap'] | null = null;

	// Listener references — captured at outer scope so `destroy()`
	// can pass the *exact same* function reference to
	// `removeEventListener`. They're populated inside the loader
	// resolver, so they may still be `null` at the moment `destroy()`
	// runs (e.g. component unmounted before the dynamic import
	// resolved). The destroy path handles that case gracefully.
	let onEnter: (() => void) | null = null;
	let onLeave: (() => void) | null = null;

	loadGsap().then((bundle) => {
		if (!bundle) return;
		const { gsap } = bundle;
		gsapRef = gsap;

		// Mouseenter — tween `borderColor` to the configured color
		// at `duration` seconds with `EASE.smooth` (the design-spec'd
		// hover ease, shared with `hoverLift`). `gsap.to` is fine
		// here even though it allocates per event: hover transitions
		// fire at most a few times per second on real input, and
		// borderColor (a string) isn't quickTo-eligible anyway.
		onEnter = () => {
			gsap.to(node, {
				borderColor: color,
				duration,
				ease: EASE.smooth
			});
		};

		// Mouseleave — inverse tween back to the neutral
		// `var(--color-border)` token. Per Requirement 4.9 the leave
		// duration is `duration * 1.4` (slightly slower than enter)
		// for a visually pleasing settle, matching `hoverLift`.
		onLeave = () => {
			gsap.to(node, {
				borderColor: 'var(--color-border)',
				duration: duration * 1.4,
				ease: EASE.smooth
			});
		};

		node.addEventListener('mouseenter', onEnter);
		node.addEventListener('mouseleave', onLeave);
	});

	// Cleanup. The destroy path must be safe even when the dynamic
	// `loadGsap()` call hasn't resolved yet (component torn down
	// before GSAP loaded). All three captured references are
	// nullable, so we guard each one before touching it.
	return {
		destroy() {
			if (onEnter) node.removeEventListener('mouseenter', onEnter);
			if (onLeave) node.removeEventListener('mouseleave', onLeave);
			// Cancel any in-flight `borderColor` tween against this
			// node. If gsap never finished loading, there are no
			// tweens to kill, so the guard is purely defensive.
			gsapRef?.killTweensOf(node);
		}
	};
};

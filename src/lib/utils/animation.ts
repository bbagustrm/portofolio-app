export const DURATION = {
	fast: 0.18,
	normal: 0.4,
	slow: 0.6,
	verySlow: 0.8
} as const;

/**
 * GSAP-flavored easing names. Pass directly as the `ease` option to
 * `gsap.to / gsap.from / gsap.timeline`. Replaces the previous bezier
 * array-based `EASING` constant (motion v12 era).
 */
export const EASE = {
	out: 'power3.out',
	inOut: 'power2.inOut',
	spring: 'back.out(1.6)',
	expo: 'expo.out',
	smooth: 'power1.out'
} as const;

export const STAGGER = {
	fast: 0.04,
	normal: 0.07,
	slow: 0.12
} as const;

/**
 * Returns `true` when animations should run, `false` otherwise.
 *
 * Behavior:
 * - SSR (`typeof window === 'undefined'`): returns `false`.
 * - Browser with `prefers-reduced-motion: reduce` active: returns `false`.
 * - Browser otherwise: returns `true`.
 *
 * **No-cache contract**: this function MUST read
 * `window.matchMedia('(prefers-reduced-motion: reduce)').matches` fresh on
 * every call. Do NOT memoize the result or hoist the `MediaQueryList` to
 * module scope — users can toggle the OS setting without reloading the
 * tab, and we want the next animation entry point (action mount, hover,
 * onNavigate) to honor the new value immediately.
 *
 * Per Requirement 2.7: "WHEN `shouldAnimate()` dipanggil ke-N kali tanpa
 * caching THEN sistem SHALL membaca `matchMedia` setiap pemanggilan agar
 * perubahan setting OS terdeteksi tanpa reload."
 */
export function shouldAnimate(): boolean {
	if (typeof window === 'undefined') return false;
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns `true` when the current environment supports the native
 * [View Transitions API](https://developer.mozilla.org/docs/Web/API/View_Transitions_API)
 * (`document.startViewTransition`), `false` otherwise.
 *
 * Behavior:
 * - SSR (`typeof document === 'undefined'`): returns `false`.
 * - Browser without `startViewTransition` on `document` (e.g. Firefox, older
 *   Safari): returns `false`.
 * - Browser with `'startViewTransition' in document`: returns `true`.
 *
 * Used by the page-transition layer (`+layout.svelte`) to branch between
 * the native View Transitions path and the GSAP fade fallback.
 *
 * Per Requirement 2.8: "WHEN `supportsViewTransitions()` dipanggil di
 * browser yang men-support View Transitions API THEN sistem SHALL
 * mengembalikan `true`; di environment server atau browser tanpa support,
 * mengembalikan `false`."
 */
export function supportsViewTransitions(): boolean {
	return typeof document !== 'undefined' && 'startViewTransition' in document;
}

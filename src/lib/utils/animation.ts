export const DURATION = {
	fast: 0.15,
	normal: 0.4,
	slow: 0.6,
	verySlow: 0.8
} as const;

export const EASING = {
	out: [0.0, 0.0, 0.2, 1.0] as number[],
	inOut: [0.4, 0.0, 0.2, 1.0] as number[],
	spring: [0.34, 1.56, 0.64, 1.0] as number[]
} as const;

export const STAGGER = {
	fast: 0.05,
	normal: 0.08,
	slow: 0.12
} as const;

export function shouldAnimate(): boolean {
	if (typeof window === 'undefined') return false;
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function revealOnScroll(
	element: Element,
	options: { delay?: number; duration?: number; y?: number } = {}
) {
	if (!shouldAnimate()) return;
	const { delay = 0, duration = 0.5, y = 24 } = options;
	const { animate, inView } = await import('motion');

	inView(
		element,
		({ target }) => {
			animate(
				target,
				{ opacity: [0, 1], y: [y, 0] },
				{ duration, delay, easing: EASING.out }
			);
		},
		{ amount: 0.2 }
	);
}

export function supportsViewTransitions(): boolean {
	return typeof document !== 'undefined' &&
		'startViewTransition' in document;
}
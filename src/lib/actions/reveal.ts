import type { Action } from 'svelte/action';
import { shouldAnimate, EASING, DURATION } from '$lib/utils/animation';

type RevealOptions = {
	delay?: number;
	duration?: number;
	y?: number;
	x?: number;
	scale?: number;
	once?: boolean;
	amount?: number;
};

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (
	node,
	options = {}
) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		delay = 0,
		duration = DURATION.slow,
		y = 24,
		x = 0,
		scale = 1,
		amount = 0.15
	} = options;

	// Set initial state
	node.style.opacity = '0';
	if (y !== 0) node.style.transform = `translateY(${y}px)`;
	if (x !== 0) node.style.transform = `translateX(${x}px)`;
	if (scale !== 1) node.style.transform = `scale(${scale})`;

	let cleanup: (() => void) | undefined;

	import('motion').then(({ animate, inView }) => {
		const stop = inView(
			node,
			({ target }) => {
				setTimeout(() => {
					animate(
						target,
						{
							opacity: [0, 1],
							y: y !== 0 ? [y, 0] : undefined,
							x: x !== 0 ? [x, 0] : undefined,
							scale: scale !== 1 ? [scale, 1] : undefined
						},
						{ duration, easing: EASING.out }
					);
				}, delay);

				// Return void — inView akan stop setelah trigger pertama
				return () => {};
			},
			{ amount }
		);

		cleanup = stop;
	});

	return {
		destroy() {
			cleanup?.();
		}
	};
};

// Stagger action untuk container — animate children satu per satu
export const revealStagger: Action<HTMLElement, {
	delay?: number;
	stagger?: number;
	y?: number;
	duration?: number;
	amount?: number;
} | undefined> = (node, options = {}) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		delay = 0,
		stagger = 0.08,
		y = 24,
		duration = DURATION.slow,
		amount = 0.1
	} = options;

	let cleanup: (() => void) | undefined;

	import('motion').then(({ animate, inView }) => {
		const children = Array.from(node.children) as HTMLElement[];

		// Set initial state pada semua children
		children.forEach((child) => {
			child.style.opacity = '0';
			child.style.transform = `translateY(${y}px)`;
		});

		const stop = inView(
			node,
			() => {
				children.forEach((child, i) => {
					setTimeout(() => {
						animate(
							child,
							{ opacity: [0, 1], y: [y, 0] },
							{ duration, easing: EASING.out }
						);
					}, delay * 1000 + i * stagger * 1000);
				});

				return () => {};
			},
			{ amount }
		);

		cleanup = stop;
	});

	return {
		destroy() {
			cleanup?.();
		}
	};
};
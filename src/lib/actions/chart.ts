import type { Action } from 'svelte/action';
import { shouldAnimate } from '$lib/utils/animation';

type BarAnimOptions = {
	delay?: number;
	duration?: number;
	stagger?: number;
};

// Animate bar chart heights dari 0
export const animateBars: Action<HTMLElement, BarAnimOptions | undefined> = (
	node,
	options = {}
) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { delay = 0, duration = 600, stagger = 30 } = options;

	const bars = Array.from(node.querySelectorAll('[data-bar]')) as HTMLElement[];

	// Simpan target heights
	const targets = bars.map((bar) => bar.style.height);

	// Set initial ke 0
	bars.forEach((bar) => (bar.style.height = '2px'));

	let observer: IntersectionObserver;
	let rafIds: number[] = [];

	function animateBar(bar: HTMLElement, targetH: string, startTime: number) {
		const start = performance.now();

		function frame(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

			const targetPx = parseFloat(targetH);
			const current = Math.max(eased * targetPx, 2);
			bar.style.height = `${current}%`;

			if (progress < 1) {
				const id = requestAnimationFrame(frame);
				rafIds.push(id);
			} else {
				bar.style.height = targetH;
			}
		}

		const id = requestAnimationFrame(frame);
		rafIds.push(id);
	}

	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				setTimeout(() => {
					bars.forEach((bar, i) => {
						setTimeout(() => {
							animateBar(bar, targets[i], performance.now());
						}, i * stagger);
					});
				}, delay);
				observer.disconnect();
			}
		},
		{ threshold: 0.2 }
	);

	observer.observe(node);

	return {
		destroy() {
			rafIds.forEach(cancelAnimationFrame);
			observer?.disconnect();
		}
	};
};

// Progress bar animate width dari 0
export const animateProgress: Action<HTMLElement, { delay?: number; duration?: number } | undefined> = (
	node,
	options = {}
) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { delay = 0, duration = 800 } = options;
	const targetWidth = node.style.width;
	node.style.width = '0%';

	let observer: IntersectionObserver;

	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				setTimeout(() => {
					node.style.transition = `width ${duration}ms cubic-bezier(0.0, 0.0, 0.2, 1)`;
					node.style.width = targetWidth;
				}, delay);
				observer.disconnect();
			}
		},
		{ threshold: 0.5 }
	);

	observer.observe(node);

	return {
		destroy() {
			observer?.disconnect();
		}
	};
};
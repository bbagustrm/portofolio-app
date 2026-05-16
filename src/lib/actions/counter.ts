import type { Action } from 'svelte/action';
import { shouldAnimate } from '$lib/utils/animation';

type CounterOptions = {
	target: number;
	duration?: number;
	delay?: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	easing?: (t: number) => number;
};

// Easing functions
function easeOutExpo(t: number): number {
	return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

export const counter: Action<HTMLElement, CounterOptions> = (node, options) => {
	if (!shouldAnimate() || typeof window === 'undefined') {
		// Tanpa animasi — langsung tampilkan nilai akhir
		node.textContent = formatValue(options.target, options);
		return {};
	}

	let rafId: number;
	let startTime: number | null = null;
	let observer: IntersectionObserver;

	const {
		target,
		duration = 1200,
		delay = 0,
		easing = easeOutExpo
	} = options;

	function formatValue(value: number, opts: CounterOptions): string {
		const rounded = opts.decimals
			? value.toFixed(opts.decimals)
			: Math.round(value).toLocaleString();
		return `${opts.prefix ?? ''}${rounded}${opts.suffix ?? ''}`;
	}

	function animate(timestamp: number) {
		if (!startTime) startTime = timestamp;

		const elapsed = timestamp - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const easedProgress = easing(progress);
		const current = easedProgress * target;

		node.textContent = formatValue(current, options);

		if (progress < 1) {
			rafId = requestAnimationFrame(animate);
		} else {
			node.textContent = formatValue(target, options);
		}
	}

	function start() {
		if (delay > 0) {
			setTimeout(() => {
				rafId = requestAnimationFrame(animate);
			}, delay);
		} else {
			rafId = requestAnimationFrame(animate);
		}
	}

	// Trigger saat elemen masuk viewport
	observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				start();
				observer.disconnect();
			}
		},
		{ threshold: 0.3 }
	);

	observer.observe(node);

	// Set initial value
	node.textContent = '0';

	return {
		update(newOptions: CounterOptions) {
			cancelAnimationFrame(rafId);
			startTime = null;
			node.textContent = '0';
			Object.assign(options, newOptions);
		},
		destroy() {
			cancelAnimationFrame(rafId);
			observer?.disconnect();
		}
	};
};
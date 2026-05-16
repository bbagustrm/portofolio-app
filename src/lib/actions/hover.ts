import type { Action } from 'svelte/action';
import { shouldAnimate } from '$lib/utils/animation';

type HoverOptions = {
	y?: number;
	scale?: number;
	duration?: number;
	glowColor?: string;
};

// Lift + glow effect pada hover
export const hoverLift: Action<HTMLElement, HoverOptions | undefined> = (
	node,
	options = {}
) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const {
		y = -4,
		scale = 1,
		duration = 0.2,
		glowColor = 'var(--color-primary)'
	} = options;

	let cleanup: (() => void) | undefined;

	import('motion').then(({ animate }) => {
		function onEnter() {
			animate(
				node,
				{
					y: [0, y],
					scale: scale !== 1 ? [1, scale] : undefined,
					boxShadow: [`0 0 0 0 transparent`, `0 8px 32px -8px ${glowColor}33`]
				},
				{ duration, easing: [0.0, 0.0, 0.2, 1.0] }
			);
		}

		function onLeave() {
			animate(
				node,
				{
					y: [null, 0],
					scale: scale !== 1 ? [null, 1] : undefined,
					boxShadow: [`0 8px 32px -8px ${glowColor}33`, `0 0 0 0 transparent`]
				},
				{ duration: duration * 1.5, easing: [0.4, 0.0, 0.2, 1.0] }
			);
		}

		node.addEventListener('mouseenter', onEnter);
		node.addEventListener('mouseleave', onLeave);

		cleanup = () => {
			node.removeEventListener('mouseenter', onEnter);
			node.removeEventListener('mouseleave', onLeave);
		};
	});

	return { destroy() { cleanup?.(); } };
};

// Border glow — highlight border saat hover
export const hoverBorder: Action<HTMLElement, { color?: string; duration?: number } | undefined> = (
	node,
	options = {}
) => {
	if (!shouldAnimate() || typeof window === 'undefined') return {};

	const { duration = 0.2 } = options;

	let cleanup: (() => void) | undefined;

	import('motion').then(({ animate }) => {
		function onEnter() {
			animate(node, { borderColor: 'var(--color-primary)' }, { duration });
		}

		function onLeave() {
			animate(node, { borderColor: 'var(--color-border)' }, { duration: duration * 1.5 });
		}

		node.addEventListener('mouseenter', onEnter);
		node.addEventListener('mouseleave', onLeave);

		cleanup = () => {
			node.removeEventListener('mouseenter', onEnter);
			node.removeEventListener('mouseleave', onLeave);
		};
	});

	return { destroy() { cleanup?.(); } };
};
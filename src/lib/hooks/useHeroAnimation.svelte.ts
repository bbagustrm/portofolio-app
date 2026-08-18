import { onMount } from 'svelte';
import { shouldAnimate, DURATION, EASING } from '$lib/utils/animation';

type AnimationElements = {
	heroBadgeMobile: HTMLElement | null;
	heroBadgeDesktop: HTMLElement | null;
	heroLine1: HTMLElement | null;
	heroLine2: HTMLElement | null;
	heroBio: HTMLElement | null;
	heroButtons: HTMLElement | null;
	heroSocials: HTMLElement | null;
};

export function useHeroAnimation() {
	let elements = $state<AnimationElements>({
		heroBadgeMobile: null,
		heroBadgeDesktop: null,
		heroLine1: null,
		heroLine2: null,
		heroBio: null,
		heroButtons: null,
		heroSocials: null
	});

	onMount(async () => {
		if (!shouldAnimate()) return;

		const { animate } = await import('motion');

		const allEls = [
			elements.heroBadgeMobile,
			elements.heroBadgeDesktop,
			elements.heroLine1,
			elements.heroLine2,
			elements.heroBio,
			elements.heroButtons,
			elements.heroSocials
		].filter(Boolean) as HTMLElement[];

		allEls.forEach((el) => {
			el.style.opacity = '0';
			el.style.transform = 'translateY(32px)';
		});

		const animateEl = (
			el: HTMLElement | null,
			delay: number,
			y = 24,
			easing = EASING.out
		) => {
			if (!el) return;
			setTimeout(() => {
				animate(
					el,
					{ opacity: [0, 1], y: [y, 0] },
					{ duration: DURATION.slow, easing }
				);
			}, delay);
		};

		animateEl(elements.heroBadgeMobile, 0, 16);
		animateEl(elements.heroBadgeDesktop, 0, 16);
		animateEl(elements.heroLine1, 120, 40);
		animateEl(elements.heroLine2, 240, 40, EASING.spring);
		animateEl(elements.heroBio, 420, 24);
		animateEl(elements.heroButtons, 540, 20);
		animateEl(elements.heroSocials, 660, 16);
	});

	return {
		elements
	};
}

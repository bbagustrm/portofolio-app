<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import ModeToggle from './ModeToggle.svelte';
	import { List } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { shouldAnimate } from '$lib/utils/animation';
	import { loadGsap, type GsapBundle } from '$lib/utils/gsap-client';

	let { user = null } = $props<{ user?: any }>();

	let mobileOpen = $state(false);
	// `scrolled` toggles the sticky shrink / blur styling. Driven by a
	// ScrollTrigger `onEnter` / `onLeaveBack` pair (Task 8.4) so we no
	// longer need a per-pixel scroll listener that re-runs Svelte
	// reactivity on every frame (Requirement 8.7).
	let scrolled = $state(false);

	// `bind:this` target for the scroll progress bar. The progress tween
	// (Task 8.5) animates this element's `width` from 0% → 100% via a
	// scrubbed ScrollTrigger; rendering the bar unconditionally (instead
	// of `{#if scrolled}`) keeps the binding stable so GSAP can mutate it
	// across the entire scroll range.
	let progressBar = $state<HTMLElement | null>(null);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/portfolio', label: 'Portfolio' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/gallery', label: 'Gallery' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function closeMenu() {
		mobileOpen = false;
	}

	// `gsap.context()` return type, sourced from the live bundle so the
	// component-scope handle stays in lockstep with `loadGsap()`.
	// Stored at component scope so `onDestroy` can revert it (Task 8.7).
	type GsapContext = ReturnType<GsapBundle['gsap']['context']>;
	let ctx: GsapContext | undefined;

	// Navbar scroll behavior — Task 8. Replaces the previous manual
	// `addEventListener('scroll', ...)` + `$derived` chain (Task 8.1 /
	// 8.2) that re-ran on every scroll pixel. The new implementation
	// delegates to ScrollTrigger:
	//
	//   - Sticky shrink toggle  → discrete `onEnter` / `onLeaveBack`
	//     callbacks at the 20px threshold (Task 8.4).
	//   - Progress bar fill     → continuous scrub tween from 0% → 100%
	//     across the document height (Task 8.5).
	//
	// Reduced-motion path (Task 8.8 / Requirement 8.5): we still need
	// the `scrolled` state to update so the navbar shrink/blur styling
	// reacts to scroll, but we skip the progress bar tween entirely.
	// We use a lightweight ScrollTrigger (no tween, just callbacks) for
	// the toggle and seed the initial state from `window.scrollY` so the
	// navbar renders in the correct visual state on load (e.g. when the
	// user navigates back to a page that was already scrolled).
	onMount(() => {
		// SSR guard — `onMount` only runs in the browser, but the ref
		// reads below are still safer behind this check.
		if (typeof window === 'undefined') return;

		// Seed initial state from the current scroll position so a navbar
		// mounted on an already-scrolled page (back/forward navigation,
		// hash anchor) renders in the correct shrink state immediately,
		// before any ScrollTrigger fires.
		scrolled = window.scrollY > 20;

		const animate = shouldAnimate();

		loadGsap()
			.then((bundle) => {
				if (!bundle) return;
				const { gsap, ScrollTrigger } = bundle;

				ctx = gsap.context(() => {
					// Sticky shrink toggle — Task 8.4. Fires once when the
					// page crosses 20px from the top (`onEnter`) and again
					// when scrolling back past it (`onLeaveBack`). No
					// per-pixel work; the trigger only runs callbacks at
					// the threshold boundary.
					ScrollTrigger.create({
						start: 'top top-=20',
						onEnter: () => {
							scrolled = true;
						},
						onLeaveBack: () => {
							scrolled = false;
						}
					});

					// Progress bar tween — Task 8.5. Skipped under
					// reduced-motion (Task 8.8 / Requirement 8.5): the
					// progress bar simply stays at 0% width while the
					// shrink toggle above continues to function.
					if (animate && progressBar) {
						gsap.to(progressBar, {
							width: '100%',
							ease: 'none',
							scrollTrigger: {
								trigger: document.documentElement,
								start: 'top top',
								end: 'bottom bottom',
								scrub: 0.3
							}
						});
					}
				});
			})
			.catch(() => {
				// `loadGsap()` rejection (chunk load failure, etc.) is
				// non-fatal here: the navbar still renders, and `scrolled`
				// is seeded from `window.scrollY` above so the shrink
				// styling at least reflects the page's load-time scroll
				// position. Swallowing the error keeps the navbar usable
				// even if the GSAP bundle never arrives.
			});
	});

	// Cleanup — Task 8.7. `ctx?.revert()` kills every ScrollTrigger and
	// tween created inside the setup callback so navigating away from
	// the layout (or HMR replacing this module) does not leak ghost
	// triggers (Requirement 13.2 / 13.3 / 13.4).
	onDestroy(() => {
		ctx?.revert();
		ctx = undefined;
	});
</script>

<header
	class="sticky top-0 z-50 w-full transition-all duration-300
		{scrolled ? 'border-b shadow-sm' : 'border-b border-transparent'}"
	style="
		background: oklch(from var(--background) l c h / {scrolled ? 0.95 : 0.8});
		backdrop-filter: blur({scrolled ? 16 : 8}px);
	"
>
	<div
		class="container mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300
			{scrolled ? 'h-12' : 'h-16'}"
	>
		<!-- Logo — shrink saat scroll -->

		<a
			href="/"
			style="view-transition-name: site-logo"
			class="font-sans font-semibold tracking-tight transition-all duration-300 hover:opacity-80
		{scrolled ? 'text-base' : 'text-xl'}"
		>
			atmojo<span class="font-bold text-primary">.</span>pro
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden items-center gap-1 md:flex">
			{#each links as link}
				<a
					href={link.href}
					class="rounded-md px-3 py-1.5 text-sm transition-colors
				{isActive(link.href)
						? 'bg-muted font-medium text-foreground'
						: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}"
				>
					{link.label}
				</a>
			{/each}

			{#if user}
				<a href="/dashboard" class="ml-2">
					<Button size="sm">Dashboard</Button>
				</a>
			{/if}

			<div class="ml-1">
				<ModeToggle />
			</div>
		</nav>

		<!-- Mobile -->
		<div class="flex items-center gap-1 md:hidden">
			<ModeToggle />

			<Sheet.Root bind:open={mobileOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" aria-label="Open menu">
							<List class="size-5" />
						</Button>
					{/snippet}
				</Sheet.Trigger>

				<Sheet.Content side="right" class="w-64">
					<Sheet.Header>
						<Sheet.Title class="text-left font-sans">
							atmojo<span class="font-bold text-primary">.</span>pro
						</Sheet.Title>
					</Sheet.Header>

					<Separator class="my-4" />

					<nav class="flex flex-col gap-1">
						{#each links as link}
							<a
								href={link.href}
								onclick={closeMenu}
								class="rounded-md px-3 py-2 text-sm transition-colors
							{isActive(link.href)
									? 'bg-muted font-medium text-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
							>
								{link.label}
							</a>
						{/each}

						{#if user}
							<Separator class="my-2" />
							<a href="/dashboard" onclick={closeMenu}>
								<Button size="sm" class="w-full">Dashboard</Button>
							</a>
						{/if}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<!--
		Scroll progress bar.

		Rendered unconditionally (not gated on `{#if scrolled}` like the
		previous implementation) so the `bind:this={progressBar}` binding
		is stable across the entire scroll range — GSAP needs a live
		element reference to animate `width` against. Visibility is
		instead controlled via opacity tied to `scrolled`, which keeps
		the bar invisible at the top of the page without tearing down
		the GSAP target.
	-->
	<div
		bind:this={progressBar}
		aria-hidden="true"
		class="absolute bottom-0 left-0 h-[1.5px] bg-primary/50 transition-opacity duration-200
			{scrolled ? 'opacity-100' : 'opacity-0'}"
		style="width: 0%;"
	></div>
</header>

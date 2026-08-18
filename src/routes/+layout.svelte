<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { invalidate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { shouldAnimate } from '$lib/utils/animation';
	import { loadGsap } from '$lib/utils/gsap-client';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let { data, children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		},
	});

	// ── Page transitions (Task 9) ────────────────────────
	// Three-branch handler driven by the spec's accessibility +
	// progressive-enhancement contract:
	//
	//   1. `shouldAnimate() === false` → reduced-motion or SSR. Return
	//      `void` so SvelteKit performs the navigation immediately
	//      without any wrapper (Requirement 9.1 / 11.6).
	//   2. Native View Transitions API present → wrap the navigation in
	//      `document.startViewTransition` so shared elements (the
	//      Navbar's `view-transition-name: site-logo`) cross-fade on
	//      the compositor thread (Requirement 9.2).
	//   3. Fallback → lazy-load GSAP and run a fade-out → swap →
	//      fade-in tween on the route container (Requirement 9.3).
	//      `loadGsap()` returning `null` (or rejecting) resolves the
	//      promise immediately so navigation is never blocked
	//      (Requirement 9.4 / Task 9.5).
	onNavigate((navigation) => {
		// Branch 0 — reduced motion / SSR. `onNavigate` only fires in
		// the browser, so the SSR side of `shouldAnimate()` is mostly
		// belt-and-suspenders, but it keeps the entry point uniform
		// with every other animation surface in the app.
		if (!shouldAnimate()) return;

		// Branch 1 — native View Transitions. The exact promise shape
		// mirrors Task 9.3 verbatim: resolve as soon as
		// `startViewTransition` has captured the old DOM, then await
		// `navigation.complete` inside the callback so the API can
		// snapshot the new DOM and run the cross-fade. The shared
		// element transition for the Navbar logo (Task 9.6 /
		// Requirement 9.5) is wired purely via CSS
		// (`view-transition-name: site-logo` on the logo `<a>` in
		// Navbar.svelte) — no JS coordination required here.
		if ('startViewTransition' in document) {
			return new Promise<void>((resolve) => {
				document.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				});
			});
		}

		// Branch 2 — GSAP fade fallback for browsers without View
		// Transitions (Firefox stable at the time of writing). We
		// lazy-load GSAP via the singleton loader so the tween bundle
		// is only fetched when actually needed.
		return new Promise<void>((resolve) => {
			loadGsap()
				.then((bundle) => {
					// `bundle === null` happens in two cases:
					//   - SSR (impossible inside `onNavigate`, but the
					//     loader still guards for it);
					//   - any future code path where the loader chooses
					//     to opt out.
					// Either way we must not block navigation: resolve
					// immediately and let SvelteKit proceed without a
					// transition (Task 9.5 / Requirement 9.4).
					if (!bundle) {
						resolve();
						return;
					}
					const { gsap } = bundle;

					// Target the current route container. `main` covers
					// the public layout (`(public)/+layout.svelte` wraps
					// children in `<main class="flex-1">`); the
					// `[data-route-root]` selector is reserved for
					// non-`<main>` layouts (e.g. dashboard) that may opt
					// in by tagging their root element.
					const main = document.querySelector<HTMLElement>('main, [data-route-root]');
					if (!main) {
						// No element to animate — fall through cleanly so
						// the navigation still completes (Requirement
						// 9.4: graceful degradation).
						resolve();
						return;
					}

					// Fade-out → swap → fade-in. The exact tokens
					// (durations / eases / offsets) are pinned by Task
					// 9.4 so the visual rhythm matches the spec across
					// every fallback browser.
					gsap.to(main, {
						opacity: 0,
						y: -8,
						duration: 0.18,
						ease: 'power2.in',
						onComplete: async () => {
							// Resolve the navigation promise FIRST so
							// SvelteKit can swap the DOM, then await
							// `navigation.complete` to be sure the new
							// route has rendered before we play the
							// fade-in. Awaiting `navigation.complete`
							// inside `onComplete` mirrors the View
							// Transitions branch and keeps both paths
							// observationally equivalent for callers.
							resolve();
							await navigation.complete;
							// `fromTo` guarantees the start state is
							// applied even when the previous tween's
							// final values (`opacity: 0, y: -8`) have
							// just landed on the (now-replaced) DOM
							// node. `power2.out` complements the
							// `power2.in` exit for symmetric pacing.
							gsap.fromTo(
								main,
								{ opacity: 0, y: 8 },
								{
									opacity: 1,
									y: 0,
									duration: 0.24,
									ease: 'power2.out'
								}
							);
						}
					});
				})
				.catch(() => {
					// Loader rejection (chunk load failure, etc.) is
					// non-fatal: skip the animation and let the
					// navigation finish without ceremony (Requirement
					// 9.4: graceful degradation).
					resolve();
				});
		});
	});

	// ── Auth sync antar tab ──────────────────────────────
	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<ModeWatcher defaultMode="system" />
<Toaster richColors position="top-right" />

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>

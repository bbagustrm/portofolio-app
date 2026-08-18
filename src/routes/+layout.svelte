<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { invalidate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { shouldAnimate } from '$lib/utils/animation';
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

		// Branch 2 — Instant transition fallback for browsers without View
		// Transitions (Firefox). No animation, just let SvelteKit swap instantly.
		// This ensures navigation never blocks and provides instant response.
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

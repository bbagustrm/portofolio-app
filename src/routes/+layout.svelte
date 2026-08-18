<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { invalidate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { shouldAnimate } from '$lib/utils/animation';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { browser } from '$app/environment';
	import { initializeLanguage } from '$lib/i18n/init';
	import { inject } from '@vercel/analytics';

	let { data, children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				staleTime: 60 * 1000,
				gcTime: 5 * 60 * 1000,
				retry: 1,
				refetchOnWindowFocus: false
			}
		}
	});

	// ── View Transitions API ─────────────────────────────
	onNavigate((navigation) => {
		// Fallback graceful kalau browser tidak support
		if (!document.startViewTransition || !shouldAnimate()) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// ── Auth sync antar tab ──────────────────────────────
	onMount(() => {
		initializeLanguage();
		
		// Only inject Vercel Analytics in production (not localhost)
		if (browser && window.location.hostname !== 'localhost') {
			inject();
		}
		
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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
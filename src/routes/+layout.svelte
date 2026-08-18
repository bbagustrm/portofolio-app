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

	onNavigate((navigation) => {
		if (!shouldAnimate()) return;

		if ('startViewTransition' in document) {
			return new Promise<void>((resolve) => {
				document.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				});
			});
		}
	});

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

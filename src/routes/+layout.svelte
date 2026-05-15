<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { invalidate, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { shouldAnimate } from '$lib/utils/animation';

	let { data, children } = $props();

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

{@render children()}
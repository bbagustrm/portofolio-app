<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let { children } = $props();

	onMount(() => {
		// Sync session antar tab
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<ModeWatcher defaultMode="system" />
<Toaster richColors position="top-right" />

{@render children()}
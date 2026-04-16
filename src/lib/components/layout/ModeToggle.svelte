<script lang="ts">
	import { setMode } from 'mode-watcher';
	import { Sun, Moon } from 'phosphor-svelte';
	import { Button } from '$lib/components/ui/button';

	let isDark = $state(false);

	$effect(() => {
		isDark = document.documentElement.classList.contains('dark');

		const observer = new MutationObserver(() => {
			isDark = document.documentElement.classList.contains('dark');
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});

		return () => observer.disconnect();
	});

	function toggle() {
		setMode(isDark ? 'light' : 'dark');
	}
</script>

<Button variant="ghost" size="icon" onclick={toggle} aria-label="Toggle theme">
	{#if isDark}
		<Sun class="size-4" />
	{:else}
		<Moon class="size-4" />
	{/if}
</Button>
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { SignOut } from 'phosphor-svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background">
	<header class="border-b px-6 py-3 flex items-center justify-between">
		<span class="font-semibold">Dashboard</span>

		<form method="POST" action="/logout">
			<Button variant="ghost" size="sm" type="submit">
				<SignOut size={16} class="mr-2" />
				Logout
			</Button>
		</form>
	</header>

	<main class="p-6">
		{@render children()}
	</main>
</div>
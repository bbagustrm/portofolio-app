<script lang="ts">
	import ProjectCard from '$lib/components/portfolio/ProjectCard.svelte';

	let { data } = $props();

	let selectedTech = $state<string | null>(null);

	const allTechs = $derived(
		[...new Set(data.projects.flatMap((p) => p.tech_stack))].sort()
	);

	const filtered = $derived(
		selectedTech
			? data.projects.filter((p) => p.tech_stack.includes(selectedTech!))
			: data.projects
	);
</script>

<svelte:head>
	<title>Portfolio — Atmojo</title>
	<meta name="description" content="Projects and work I've built." />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-4 py-16">
	<!-- Header -->
	<div class="mb-12">
		<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">My Work</p>
		<h1 class="text-5xl font-semibold mb-4">Portfolio</h1>
		<p class="text-muted-foreground max-w-xl text-lg">
			A collection of projects I've built — from web apps to open source tools.
		</p>
	</div>

	<!-- Tech filter -->
	{#if allTechs.length > 0}
		<div class="flex flex-wrap gap-2 mb-10">
			<button
				onclick={() => (selectedTech = null)}
				class="text-xs px-3 py-1.5 rounded-full border transition-colors
					{selectedTech === null
						? 'bg-primary text-primary-foreground border-primary'
						: 'border-border hover:bg-muted text-muted-foreground'}"
			>
				All
			</button>
			{#each allTechs as tech}
				<button
					onclick={() => (selectedTech = selectedTech === tech ? null : tech)}
					class="text-xs px-3 py-1.5 rounded-full border transition-colors
						{selectedTech === tech
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border hover:bg-muted text-muted-foreground'}"
				>
					{tech}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Grid -->
	{#if filtered.length > 0}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20 text-muted-foreground">
			<p class="text-4xl mb-4">🗂️</p>
			<p>No projects found{selectedTech ? ` for "${selectedTech}"` : ''}.</p>
		</div>
	{/if}
</div>
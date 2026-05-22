<script lang="ts">
	import ProjectCard from '$lib/components/portfolio/ProjectCard.svelte';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import * as m from '$paraglide/messages';
	import { useProjects } from '$lib/queries/projects.svelte';

	let { data } = $props();

	const projectsQuery = useProjects();
	
	const projects = $derived(projectsQuery.data ?? data.projects);

	let selectedTech = $state<string | null>(null);

	const allTechs = $derived(
		[...new Set(projects.flatMap((p) => p.tech_stack))].sort()
	);

	const filtered = $derived(
		selectedTech
			? projects.filter((p) => p.tech_stack.includes(selectedTech!))
			: projects
	);
</script>

<svelte:head>
	<title>Portfolio — Atmojo</title>
	<meta name="description" content={m.meta_portfolio_description()} />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-4 py-16">
	<!-- Header -->
	<div use:reveal={{ y: 20 }} class="mb-12">
		<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">{m.portfolio_title()}</p>
		<h1 class="text-5xl font-semibold mb-4">{m.portfolio_title()}</h1>
		<p class="text-muted-foreground max-w-xl text-lg">
			{m.portfolio_subtitle()}
		</p>
	</div>

	<!-- Tech filter -->
	{#if allTechs.length > 0}
		<div use:reveal={{ y: 16, delay: 0.1 }} class="flex flex-wrap gap-2 mb-10">
			<button
				onclick={() => (selectedTech = null)}
				class="text-xs px-3 py-1.5 rounded-full border transition-colors
					{selectedTech === null
						? 'bg-primary text-primary-foreground border-primary'
						: 'border-border hover:bg-muted text-muted-foreground'}"
			>
				{m.portfolio_filter_all()}
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
		<div use:revealStagger={{ stagger: 0.08, y: 28 }} class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div use:revealStagger={{ stagger: 0.08, y: 28 }} class="text-center py-20 text-muted-foreground">
			<p class="text-4xl mb-4">🗂️</p>
			<p>{m.portfolio_empty()}</p>
		</div>
	{/if}
</div>
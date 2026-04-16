<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, ArrowSquareOut, GithubLogo } from 'phosphor-svelte';
	import { formatDate } from '$lib/utils';

	let { data } = $props();
	let project = $derived(data.project);
</script>

<svelte:head>
	<title>{project.title} — Portfolio</title>
	<meta name="description" content={project.description ?? ''} />
</svelte:head>

<article class="container mx-auto max-w-3xl px-4 py-16">
	<!-- Back -->
	<a href="/portfolio" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
		<ArrowLeft size={16} />
		Back to Portfolio
	</a>

	<!-- Cover -->
	{#if project.cover_url}
		<div class="aspect-video rounded-xl overflow-hidden mb-8">
			<img
				src={project.cover_url}
				alt={project.title}
				class="w-full h-full object-cover"
			/>
		</div>
	{/if}

	<!-- Meta -->
	<div class="mb-8">
		<div class="flex flex-wrap items-start justify-between gap-4 mb-4">
			<h1 class="text-3xl font-bold">{project.title}</h1>
			<div class="flex gap-2">
				{#if project.demo_url}
					<a href={project.demo_url} target="_blank" rel="noopener noreferrer">
						<Button class="gap-2">
							<ArrowSquareOut size={16} />
							Live Demo
						</Button>
					</a>
				{/if}
				{#if project.repo_url}
					<a href={project.repo_url} target="_blank" rel="noopener noreferrer">
						<Button variant="outline" class="gap-2">
							<GithubLogo size={16} />
							Source
						</Button>
					</a>
				{/if}
			</div>
		</div>

		<p class="text-muted-foreground mb-4">{project.description ?? ''}</p>

		<div class="flex flex-wrap gap-1.5">
			{#each project.tech_stack as tech}
				<Badge variant="secondary">{tech}</Badge>
			{/each}
		</div>
	</div>

	<!-- Content -->
	{#if project.content}
		<div class="prose prose-neutral dark:prose-invert max-w-none">
			{@html project.content}
		</div>
	{/if}

	<p class="text-xs text-muted-foreground mt-12">
		Published {formatDate(project.created_at)}
	</p>
</article>
<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowSquareOut, GithubLogo } from 'phosphor-svelte';
	import type { Project } from '$lib/types';

	let { project } = $props<{ project: Project }>();
</script>

<a href="/portfolio/{project.slug}" class="group block h-full">
	<Card class="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
		{#if project.cover_url}
			<div class="aspect-video overflow-hidden">
				<img
					src={project.cover_url}
					alt={project.title}
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			</div>
		{:else}
			<div class="aspect-video bg-muted flex items-center justify-center">
				<span class="text-3xl">🗂️</span>
			</div>
		{/if}

		<CardContent class="p-5 flex flex-col gap-3">
			<div>
				<div class="flex items-start justify-between gap-2 mb-1">
					<h3 class="font-semibold group-hover:text-primary transition-colors">
						{project.title}
					</h3>
					{#if project.is_featured}
						<Badge class="text-xs shrink-0">Featured</Badge>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground line-clamp-2">
					{project.description ?? ''}
				</p>
			</div>

			<div class="flex flex-wrap gap-1">
				{#each project.tech_stack.slice(0, 4) as tech}
					<Badge variant="secondary" class="text-xs">{tech}</Badge>
				{/each}
				{#if project.tech_stack.length > 4}
					<Badge variant="outline" class="text-xs">
						+{project.tech_stack.length - 4}
					</Badge>
				{/if}
			</div>

			<div class="flex gap-2 mt-auto">
				{#if project.demo_url}

					<a href={project.demo_url}
					target="_blank"
					rel="noopener noreferrer"
					onclick={(e) => e.stopPropagation()}
					>
					<Button variant="outline" size="sm" class="gap-1.5">
						<ArrowSquareOut size={12} />
						Demo
					</Button>
					</a>
				{/if}
				{#if project.repo_url}

					<a href={project.repo_url}
					target="_blank"
					rel="noopener noreferrer"
					onclick={(e) => e.stopPropagation()}
					>
					<Button variant="ghost" size="sm" class="gap-1.5">
						<GithubLogo size={12} />
						Code
					</Button>
					</a>
				{/if}
			</div>
		</CardContent>
	</Card>
</a>
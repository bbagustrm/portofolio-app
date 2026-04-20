<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowSquareOut, GithubLogo, Star } from 'phosphor-svelte';
	import type { Project } from '$lib/types';

	let { project } = $props<{ project: Project }>();
</script>

<a href="/portfolio/{project.slug}" class="group block h-full">
	<Card class="h-full overflow-hidden transition-colors hover:border-primary/40 p-0 rounded-md">

		<!-- Cover image — no zoom, no scale -->
		<div class="relative aspect-video overflow-hidden bg-muted">
			{#if project.cover_url}
				<img
					src={project.cover_url}
					alt={project.title}
					class="w-full h-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="w-full h-full flex items-center justify-center">
					<span class="text-4xl">🗂️</span>
				</div>
			{/if}

			<!-- Featured badge — absolute top right, menimpa gambar -->
			{#if project.is_featured}
				<Badge variant="default" class="bg-white text-primary text-xs absolute top-2 right-2 px-0.75">
					<Star size={16} weight="fill" />
				</Badge>
			{/if}
		</div>

		<CardContent class="px-4 pb-4 flex justify-between gap-3">
			<!-- Title & description -->
			<div>
				<h3 class="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
					{project.title}
				</h3>
				<p class="text-sm text-muted-foreground line-clamp-2">
					{project.description ?? ''}
				</p>
				<!-- Tech stack -->
				<div class="flex flex-wrap gap-1 mt-2">
					{#each project.tech_stack.slice(0, 4) as tech}
						<Badge variant="secondary" class="text-xs">{tech}</Badge>
					{/each}
					{#if project.tech_stack.length > 4}
						<Badge variant="outline" class="text-xs">+{project.tech_stack.length - 4}</Badge>
					{/if}
				</div>
			</div>

			<!-- Links — stop propagation agar tidak trigger parent <a> -->
			{#if project.demo_url || project.repo_url}
				<div class="flex gap-2 mt-auto pt-1 flex-col items-start justify-start">
					{#if project.demo_url}

						<a href={project.demo_url}
						   target="_blank"
						   rel="noopener noreferrer"
						   onclick={(e) => e.stopPropagation()}
						>
							<Button variant="default" size="lg" class="gap-1.5 lg:h-8 lg:text-xs">
								<ArrowSquareOut size={12} weight="regular" />
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
							<Button variant="outline" size="lg" class="gap-1.5 lg:h-8 lg:text-xs">
								<GithubLogo size={12} weight="regular" />
								Code
							</Button>
						</a>
					{/if}
				</div>
			{/if}
		</CardContent>
	</Card>
</a>
<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ExternalLink } from '@lucide/svelte';
	import { GithubLogo } from 'phosphor-svelte';
	import type { Project } from '$lib/types';
	import { hoverLift } from '$lib/actions/hover';

	let { project } = $props<{ project: Project }>();
</script>

<a href="/portfolio/{project.slug}" class="group block h-full">
	<div
		use:hoverLift={{ y: -5, duration: 0.2 }}
		class="h-full overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40"
	>
		<!-- Cover -->
		<div class="relative aspect-video overflow-hidden bg-muted">
			{#if project.cover_url}
				<img
					src={project.cover_url}
					alt={project.title}
					class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					loading="lazy"
				/>
			{:else}
				<div class="w-full h-full flex items-center justify-center text-3xl">🗂️</div>
			{/if}

			{#if project.is_featured}
				<span class="absolute top-2 right-2 bg-primary text-primary-foreground
					text-xs font-medium px-2.5 py-1 rounded-full shadow-sm
					translate-y-0 opacity-100 transition-all duration-300">
					Featured
				</span>
			{/if}
		</div>

		<div class="p-5 flex flex-col gap-3">
			<div>
				<h3 class="font-semibold text-base mb-1 transition-colors duration-200 group-hover:text-primary">
					{project.title}
				</h3>
				<p class="text-sm text-muted-foreground line-clamp-2">
					{project.description ?? ''}
				</p>
			</div>

			<!-- Tech badges — stagger in on hover -->
			<div class="flex flex-wrap gap-1">
				{#each project.tech_stack.slice(0, 4) as tech, i}
					<span
						class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs
							font-medium text-muted-foreground bg-secondary/50
							transition-all duration-200"
						style="transition-delay: {i * 30}ms"
					>
						{tech}
					</span>
				{/each}
				{#if project.tech_stack.length > 4}
					<Badge variant="outline" class="text-xs">+{project.tech_stack.length - 4}</Badge>
				{/if}
			</div>

			<!-- Links -->
			{#if project.demo_url || project.repo_url}
				<div class="flex gap-2 mt-auto pt-1">
					{#if project.demo_url}

						<a href={project.demo_url}
						target="_blank"
						rel="noopener noreferrer"
						onclick={(e) => e.stopPropagation()}
						>
						<Button variant="outline" size="sm" class="gap-1.5 h-8 text-xs
								opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
								transition-all duration-200">
							<ExternalLink class="size-3" />
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
						<Button variant="ghost" size="sm" class="gap-1.5 h-8 text-xs
								opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
								transition-all duration-200 delay-75">
							<GithubLogo class="size-3" />
							Code
						</Button>
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</a>
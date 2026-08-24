<script lang="ts">
	import { skillCategories } from '$lib/data/skills';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import { hoverLift } from '$lib/actions/hover';
	import * as m from '$paraglide/messages';

	function getCategoryTitle(titleKey: string): string {
		switch (titleKey) {
			case 'skills_category_software_dev':
				return m.skills_category_software_dev();
			case 'skills_category_graphic_design':
				return m.skills_category_graphic_design();
			default:
				return titleKey;
		}
	}
</script>

<svelte:head>
	<title>Skills — Atmojo</title>
	<meta name="description" content={m.skills_page_subtitle()} />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8 lg:px-4">
	<div use:reveal={{ y: 20 }} class="mb-12 text-center">
		<p class="mb-2 font-sans text-sm font-medium tracking-wider text-primary uppercase">
			{m.skills_page_title()}
		</p>
		<h1 class="mb-4 text-5xl font-semibold">{m.skills_page_title()}</h1>
		<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
			{m.skills_page_subtitle()}
		</p>
	</div>

	{#each skillCategories as category, i}
		<section class="mb-16 last:mb-0">
			<div use:reveal={{ y: 16, delay: i * 0.1 }} class="mb-8">
				<h2 class="mb-2 text-3xl font-semibold">
					{getCategoryTitle(category.titleKey)}
				</h2>
			</div>

			<div
				use:revealStagger={{ stagger: 0.05, y: 20 }}
				class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{#each category.skills as skill}
					<div
						use:hoverLift={{ y: -4, duration: 0.2 }}
						class="group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50"
					>
						<div class="mb-4 flex h-16 w-16 items-center justify-center">
							<img
								src={skill.logo}
								alt={skill.name}
								class="max-h-full max-w-full object-contain grayscale filter transition-all duration-300 group-hover:grayscale-0"
							/>
						</div>
						<p
							class="text-center text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground"
						>
							{skill.name}
						</p>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

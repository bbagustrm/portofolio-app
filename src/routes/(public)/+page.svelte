<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import {
		ArrowRight,
		GithubLogo,
		LinkedinLogo,
		Envelope,
		ArrowSquareOut
	} from 'phosphor-svelte';
	import { formatDateShort, estimateReadingTime } from '$lib/utils';
	import { techStack } from '$lib/data/tech-stack';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { data } = $props();
</script>

<svelte:head>
	<title>Bagus — Full Stack Developer</title>
	<meta
		name="description"
		content={data.profile?.bio ?? 'Personal portfolio and blog'}
	/>
</svelte:head>

<!-- HERO -->
<section class="relative overflow-hidden">
	<!-- Gradient background -->
	<div class="absolute inset-0 -z-10 pointer-events-none">
		<div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
	</div>

	<div class="container mx-auto max-w-6xl px-4 py-24 md:py-32">
		<div class="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between lg:items-start">

			<div class="w-full lg:w-1/2 flex flex-col items-center">
				<div class="inline-flex lg:hidden w-fit mb-6 items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
					<span class="size-2 rounded-full bg-yellow-500 animate-pulse"></span>
					Available for opportunities
				</div>
				<h1 class="text-5xl font-medium tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-4">
					Bagus Tri
					<span class="text-primary lg:text-9xl">
					Atmojo
				</span>
				</h1>
			</div>

			<div class="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
				<div class="hidden lg:inline-flex w-fit mb-6 items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
					<span class="size-2 rounded-full bg-yellow-500 animate-pulse"></span>
					Available for opportunities
				</div>
				<p class="text-center md:text-lg sm:px-8 md:px-16 lg:px-0 lg:text-left lg:text-xl text-muted-foreground mb-8 leading-relaxed">
					{data.profile?.bio ??
					'Full Stack Developer passionate about building modern web applications with clean code and great user experiences.'}
				</p>

				<div class="flex flex-wrap gap-3 mb-10">
					<a href="/portfolio">
						<Button size="lg" class="gap-2">
							View Portfolio
							<ArrowRight size={16} weight="regular" />
						</Button>
					</a>

					<a href="/blog">
						<Button size="lg" variant="outline" class="gap-2">
							Read Blog
						</Button>
					</a>
				</div>


				<Tooltip.Provider>
					<div class="flex items-center gap-3">

						<!-- GitHub -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<a
										{...props}
										href="https://github.com/bbagustrm"
										target="_blank"
										rel="noopener noreferrer"
										class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									>
										<GithubLogo size={28} weight="fill" />
									</a>
								{/snippet}
							</Tooltip.Trigger>

							<Tooltip.Content>
								GitHub
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- LinkedIn -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<a
										{...props}
										href="https://linkedin.com/in/bbagustrm"
										target="_blank"
										class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									>
										<LinkedinLogo size={28} weight="fill" />
									</a>
								{/snippet}
							</Tooltip.Trigger>

							<Tooltip.Content>
								LinkedIn
							</Tooltip.Content>
						</Tooltip.Root>

						<!-- Email -->
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<a
										{...props}
										href="mailto:bbagustrm@gmail.com"
										class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									>
										<Envelope size={28} weight="fill" />
									</a>
								{/snippet}
							</Tooltip.Trigger>

							<Tooltip.Content>
								Contact Me
							</Tooltip.Content>
						</Tooltip.Root>

					</div>
				</Tooltip.Provider>

			</div>
		</div>
	</div>
</section>

<!-- ─── Tech Stack Strip ──────────────────────────────── -->
<section class="border-y bg-muted/30 overflow-hidden">
	<div class="flex items-stretch">

		<!-- Label — static, tidak ikut scroll -->
		<div class="hidden md:flex shrink-0 items-center gap-2 px-6 py-4 border-r bg-muted/50 z-10">
			<span class="text-sm font-medium text-muted-foreground whitespace-nowrap">
				Tech I work with
			</span>
		</div>

		<!-- Marquee container -->
		<div class="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
			<div class="flex w-max animate-marquee gap-10 py-4 pr-10">

				<!-- Render dua kali untuk seamless loop -->
				{#each [...techStack, ...techStack] as tech, i}
					<div class="p-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
						<img
							src={tech.logo}
							alt={tech.name}
							class="size-8 object-contain"
							loading="lazy"
						/>
						<span class="whitespace-nowrap">{tech.name}</span>
					</div>
				{/each}

			</div>
		</div>
	</div>
</section>

<!-- FEATURED PROJECTS -->
{#if data.featuredProjects.length > 0}
	<section class="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-4 py-20">

		<div class="flex items-end justify-between mb-10">
			<div>
				<p class="text-sm text-primary font-medium mb-1">
					PORTFOLIO
				</p>
				<h2 class="text-3xl font-bold">
					Featured Projects
				</h2>
			</div>

			<a
				href="/portfolio"
				class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
			>
				View all
				<ArrowRight size={12} weight="regular" />
			</a>
		</div>

		<div class="grid gap-6 1 grid-cols-2 md:grid-cols-3">

			{#each data.featuredProjects as project}
				<a href="/portfolio/{project.slug}" class="group block">

					<Card class="h-full overflow-hidden p-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

						{#if project.cover_url}
							<div class="aspect-video overflow-hidden transition-transform duration-300 group-hover:scale-105">
								<img
									src={project.cover_url}
									alt={project.title}
									class="w-full h-full object-cover"
									loading="lazy"
								/>
							</div>
						{/if}

						<CardContent class="p-4">

							<h3 class="font-semibold mb-1 group-hover:text-primary transition-colors">
								{project.title}
							</h3>

							<p class="text-sm text-muted-foreground line-clamp-2 mb-3">
								{project.description ?? ''}
							</p>

							<div class="flex flex-wrap gap-1">

								{#each project.tech_stack.slice(0, 3) as tech}
									<Badge variant="outline" class="text-xs">
										{tech}
									</Badge>
								{/each}

								{#if project.tech_stack.length > 3}
									<Badge variant="outline" class="text-xs">
										+{project.tech_stack.length - 3}
									</Badge>
								{/if}

							</div>
						</CardContent>
					</Card>

				</a>
			{/each}

		</div>
	</section>
{/if}

<!-- BLOG -->
{#if data.latestPosts.length > 0}
	<section class="bg-muted/30 border-t">
		<div class="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-4 py-20">

			<div class="flex items-end justify-between mb-10">
				<div>
					<p class="text-sm text-primary font-medium mb-1">BLOG</p>
					<h2 class="text-3xl font-bold">Latest Articles</h2>
				</div>

				<a
					href="/blog"
					class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
				>
					View all
					<ArrowRight size={12} weight="regular" />
				</a>
			</div>

			<div class="grid gap-6 grid-cols-2 md:grid-cols-3">

				{#each data.latestPosts as post}
					<a href="/blog/{post.slug}" class="group block">

						<Card class="h-full overflow-hidden p-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">

							{#if post.cover_url}
								<div class="aspect-video overflow-hidden">
									<img
										src={post.cover_url}
										alt={post.title}
										class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>
								</div>
							{/if}

							<CardContent class="p-4">

								<div class="flex items-center gap-2 text-xs text-muted-foreground mb-2">
									<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
									<span>·</span>
									<span>{estimateReadingTime(post.content ?? '')}</span>
								</div>

								<h3 class="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
									{post.title}
								</h3>

								<p class="text-sm text-muted-foreground line-clamp-2">
									{post.excerpt ?? ''}
								</p>

							</CardContent>
						</Card>

					</a>
				{/each}

			</div>
		</div>
	</section>
{/if}

<!-- CTA -->
<section class="container mx-auto max-w-6xl px-4 py-20 text-center">

	<h2 class="text-3xl font-bold mb-4">
		Let's work together
	</h2>

	<p class="text-muted-foreground mb-8 max-w-md mx-auto">
		I'm open to freelance projects, collaborations, and full-time opportunities.
	</p>

	<a href="mailto:you@email.com">
		<Button size="lg" class="gap-2">
			<Envelope size={16} weight="regular" />
			Get in touch
		</Button>
	</a>

</section>
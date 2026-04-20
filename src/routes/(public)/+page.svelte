<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import {
		ArrowRight,
		GithubLogo,
		LinkedinLogo,
		Envelope,
		ArrowSquareOut,
	} from 'phosphor-svelte';
	import { formatDateShort, estimateReadingTime, timeAgo } from '$lib/utils';
	import { techStack } from '$lib/data/tech-stack';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Carousel from '$lib/components/ui/carousel';

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
	<section class="container mx-auto max-w-6xl px-2 sm:px-4 md:px-8 lg:px-4 py-20">

		<div class="flex items-end justify-between mb-10">
			<div>
				<p class="text-sm text-primary font-medium mb-1">
					PORTFOLIO
				</p>
				<h2 class="text-3xl font-semibold">
					My Projects
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

		<div class="grid gap-3 1 grid-cols-2 md:grid-cols-3">

			{#each data.featuredProjects as project}
				<a href="/portfolio/{project.slug}" class="group block">

					<Card class="rounded-md h-full overflow-hidden p-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 gap-4 md:gap-6">

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

						<CardContent class="pb-4 px-4">

							<h3 class="font-semibold text-xl mb-1 group-hover:text-primary transition-colors line-clamp-1">
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
	<section class="bg-muted/20 border-t">
		<div class="container mx-auto max-w-6xl p-4">
			<Carousel.Root
				opts={{ align: 'start', loop: false }}
				class="w-full"
			>
				<div class="flex items-center gap-4">

					<!-- Prev Button -->
					<Carousel.Previous class="static translate-y-0 shrink-0 rounded-full" />

					<!-- Viewport -->
					<div class="flex-1 overflow-hidden py-2">
						<Carousel.Content class="-ml-4">

							{#each data.latestPosts as post}
								<Carousel.Item class="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
									<a href="/blog/{post.slug}" class="group block h-full">
										<div
											class="flex gap-4 rounded-xl border bg-card h-full
										hover:border-primary/40 hover:bg-muted/30
										transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
										>
											<!-- Thumbnail -->
											<div class="shrink-0 w-20 h-20 rounded-tl-lg rounded-bl-lg overflow-hidden bg-muted">
												{#if post.cover_url}
													<img
														src={post.cover_url}
														alt={post.title}
														class="w-full h-full object-cover"
														loading="lazy"
													/>
												{:else}
													<div class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
														<span class="text-2xl">📝</span>
													</div>
												{/if}
											</div>

											<!-- Content -->
											<div class="flex-1 min-w-0 flex flex-col justify-center">
												<div>
													<h3
														class="font-medium text-sm sm:text-base leading-snug mb-1
													group-hover:text-primary transition-colors line-clamp-1"
													>
														{post.title}
													</h3>

													<p class="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
														{post.excerpt ?? ''}
													</p>
												</div>

												<div class="flex items-center gap-2 text-xs text-muted-foreground mt-2">
													<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
													<span>·</span>
													<span>{estimateReadingTime(post.content ?? '')}</span>
												</div>
											</div>
										</div>
									</a>
								</Carousel.Item>
							{/each}

						</Carousel.Content>
					</div>

					<!-- Next Button -->
					<Carousel.Next class="static translate-y-0 shrink-0 rounded-full" />

				</div>
			</Carousel.Root>

		</div>
	</section>
{/if}

<!-- ─── Gallery Preview ───────────────────────────────── -->
{#if data.galleryPosts.length > 0}
	<section class="border-t">
		<div class="container mx-auto max-w-6xl px-2 sm:px-4 md:px-8 lg:px-4 py-20">
			<div class="flex items-end justify-between mb-10">
				<div>
					<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">Memories</p>
					<h2 class="text-3xl font-semibold">Gallery</h2>
				</div>
				<a href="/gallery" class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
					View all <ArrowRight class="size-3" />
				</a>
			</div>

			<div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0">
				{#each data.galleryPosts.slice(0, 6) as post}
					{@const firstMedia = post.media?.[0]}
					<a href="/gallery/{post.id}" class="group block">
						<div class="relative aspect-square rounded-none overflow-hidden bg-muted border">
							{#if firstMedia?.type === 'image'}
								<img
									src={firstMedia.url}
									alt={post.caption ?? ''}
									class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
								/>
							{:else if firstMedia?.type === 'video'}
								<video src={firstMedia.url} class="w-full h-full object-cover" muted playsinline preload="metadata">
									<track kind="captions" />
								</video>
							{:else}
								<div class="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
							{/if}

							<!-- Hover overlay -->
							<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200">
								{#if post.caption}
									<div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
										<p class="text-white text-xs line-clamp-2">{post.caption}</p>
									</div>
								{/if}
							</div>

							{#if (post.media?.length ?? 0) > 1}
								<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
									⊞ {post.media?.length}
								</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- CTA -->
<section class="px-4 py-20 text-center bg-muted/30 border">

	<h2 class="text-3xl font-semibold mb-4">
		Let's work together
	</h2>

	<p class=" mb-8 max-w-md mx-auto">
		I'm open to freelance projects, collaborations, and full-time opportunities.
	</p>

	<a href="mailto:you@email.com">
		<Button size="lg" class="gap-2" >
			<Envelope size={16} weight="regular" />
			Get in touch
		</Button>
	</a>

</section>
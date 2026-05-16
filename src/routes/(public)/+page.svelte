<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import {
		ArrowRight,
		GithubLogo,
		LinkedinLogo,
		Envelope,
		ArrowSquareOut, Star
	} from 'phosphor-svelte';
	import { formatDateShort, estimateReadingTime, timeAgo } from '$lib/utils';
	import { techStack } from '$lib/data/tech-stack';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Carousel from '$lib/components/ui/carousel';
	import { onMount } from 'svelte';
	import { shouldAnimate, EASING, DURATION } from '$lib/utils/animation';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import ProjectCard from '$lib/components/portfolio/ProjectCard.svelte';
	import { hoverLift } from '$lib/actions/hover';

	let { data } = $props();

	// ── Hero element refs ────────────────────────────────

	let heroBadgeMobile = $state<HTMLElement | null>(null);
	let heroBadgeDesktop = $state<HTMLElement | null>(null);
	let heroBadge = $state<HTMLElement | null>(null);
	let heroLine1 = $state<HTMLElement | null>(null);
	let heroLine2 = $state<HTMLElement | null>(null);
	let heroBio = $state<HTMLElement | null>(null);
	let heroButtons = $state<HTMLElement | null>(null);
	let heroSocials = $state<HTMLElement | null>(null);

	onMount(async () => {
		if (!shouldAnimate()) return;

		const { animate, stagger } = await import('motion');

		// Set initial state — semua invisible
		const elements = [heroBadge, heroLine1, heroLine2, heroBio, heroButtons, heroSocials].filter(Boolean);
		elements.forEach((el) => {
			if (el) {
				el.style.opacity = '0';
				el.style.transform = 'translateY(32px)';
			}
		});

		// Staggered entrance
		const sequence: [HTMLElement, object, object][] = [
			[heroBadge!, { opacity: [0, 1], y: [20, 0] }, { duration: DURATION.normal, easing: EASING.out }],
			[heroLine1!, { opacity: [0, 1], y: [40, 0] }, { duration: DURATION.slow, easing: EASING.out }],
			[heroLine2!, { opacity: [0, 1], y: [40, 0] }, { duration: DURATION.slow, easing: EASING.spring }],
			[heroBio!, { opacity: [0, 1], y: [24, 0] }, { duration: DURATION.normal, easing: EASING.out }],
			[heroButtons!, { opacity: [0, 1], y: [20, 0] }, { duration: DURATION.normal, easing: EASING.out }],
			[heroSocials!, { opacity: [0, 1], y: [16, 0] }, { duration: DURATION.normal, easing: EASING.out }]
		];

		// Play dengan delay bertahap
		const delays = [0, 0.1, 0.22, 0.42, 0.56, 0.68];

		sequence.forEach(([el, keyframes, options], i) => {
			if (!el) return;
			setTimeout(() => {
				animate(el, keyframes, options as any);
			}, delays[i] * 1000);
		});
	});


	onMount(async () => {
		if (!shouldAnimate()) return;
		const { animate } = await import('motion');

		// Set initial
		const allEls = [
			heroBadgeMobile, heroBadgeDesktop,
			heroLine1, heroLine2,
			heroBio, heroButtons, heroSocials
		].filter(Boolean) as HTMLElement[];

		allEls.forEach((el) => {
			el.style.opacity = '0';
			el.style.transform = 'translateY(32px)';
		});

		const animateEl = (
			el: HTMLElement | null,
			delay: number,
			y = 24,
			easing: number[] = EASING.out
		) => {
			if (!el) return;
			setTimeout(() => {
				animate(
					el,
					{ opacity: [0, 1], y: [y, 0] },
					{ duration: DURATION.slow, easing }
				);
			}, delay);
		};

		// Badge (mobile + desktop)
		animateEl(heroBadgeMobile, 0, 16);
		animateEl(heroBadgeDesktop, 0, 16);

		// Name lines
		animateEl(heroLine1, 120, 40);
		animateEl(heroLine2, 240, 40, EASING.spring);

		// Bio, buttons, socials
		animateEl(heroBio, 420, 24);
		animateEl(heroButtons, 540, 20);
		animateEl(heroSocials, 660, 16);
	});

	onMount(async () => {
		if (!shouldAnimate()) return;
		const { animate } = await import('motion');

		const allEls = [
			heroBadgeMobile, heroBadgeDesktop,
			heroLine1, heroLine2,
			heroBio, heroButtons, heroSocials
		].filter(Boolean) as HTMLElement[];

		allEls.forEach((el) => {
			el.style.opacity = '0';
			el.style.transform = 'translateY(32px)';
		});

		const animateEl = (el: HTMLElement | null, delay: number, y = 24, easing = EASING.out) => {
			if (!el) return;
			setTimeout(() => {
				animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: DURATION.slow, easing });
			}, delay);
		};

		animateEl(heroBadgeMobile, 0, 16);
		animateEl(heroBadgeDesktop, 0, 16);
		animateEl(heroLine1, 120, 40);
		animateEl(heroLine2, 240, 40, EASING.spring);
		animateEl(heroBio, 420, 24);
		animateEl(heroButtons, 540, 20);
		animateEl(heroSocials, 660, 16);
	});
</script>

<svelte:head>
	<title>Atmojo — Full Stack Developer</title>
	<meta name="description" content={data.profile?.bio ?? 'Personal portfolio and blog'} />
</svelte:head>

<!-- ─── Hero ──────────────────────────────────────────── -->
<section class="relative overflow-hidden">
	<div class="absolute inset-0 -z-10 pointer-events-none">
		<div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl"></div>
		<div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>
	</div>

	<div class="container mx-auto max-w-6xl px-4 py-24 md:py-36">
		<div class="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between lg:items-start gap-12">

			<!-- Left — Name -->
			<div class="w-full lg:w-1/2">
				<!-- Badge — mobile only -->
				<div bind:this={heroBadgeMobile} class="inline-flex lg:hidden w-fit mb-6 items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
					<span class="size-2 rounded-full bg-[#ffd809] animate-pulse"></span>
					Available for opportunities
				</div>

				<h1 class="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]">
					<span bind:this={heroLine1} class="block">Bagus Tri</span>
					<span bind:this={heroLine2} class="block text-primary lg:text-9xl">Atmojo</span>
				</h1>
			</div>

			<!-- Right — Bio + CTA + Socials -->
			<div class="w-full lg:w-1/2 flex flex-col items-start">
				<!-- Badge — desktop only -->
				<div bind:this={heroBadgeDesktop} class="hidden lg:inline-flex w-fit mb-6 items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
					<span class="size-2 rounded-full bg-[#ffd809] animate-pulse"></span>
					Available for opportunities
				</div>

				<p bind:this={heroBio} class="text-lg text-muted-foreground mb-8 leading-relaxed">
					{data.profile?.bio ?? 'Full Stack Developer passionate about building modern web applications with clean code and great user experiences.'}
				</p>

				<div bind:this={heroButtons} class="flex flex-wrap gap-3 mb-10">
					<a href="/portfolio">
						<Button size="lg" class="gap-2 rounded-full px-6">
							View Portfolio
							<ArrowRight class="size-4" />
						</Button>
					</a>
					<a href="/blog">
						<Button size="lg" variant="outline" class="gap-2 rounded-full px-6">
							Read Blog
						</Button>
					</a>
				</div>

				<!-- Social links -->
				<div bind:this={heroSocials}>
					<Tooltip.Provider>
						<div class="flex items-center gap-1">
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}

										<a {...props}
										href={data.profile?.github_url ?? 'https://github.com'}
										target="_blank"
										rel="noopener noreferrer"
										class="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										>
										<GithubLogo class="size-5 md:size-7" />
										</a>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content side="bottom">GitHub</Tooltip.Content>
							</Tooltip.Root>

							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}

										<a {...props}
										href={data.profile?.linkedin_url ?? 'https://linkedin.com'}
										target="_blank"
										rel="noopener noreferrer"
										class="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										>
										<LinkedinLogo class="size-5 md:size-7" />
										</a>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content side="bottom">LinkedIn</Tooltip.Content>
							</Tooltip.Root>

							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}

										<a {...props}
										href="mailto:hello@atmojo.pro"
										class="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										>
										<Envelope class="size-5 md:size-7" />
										</a>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content side="bottom">Email</Tooltip.Content>
							</Tooltip.Root>
						</div>
					</Tooltip.Provider>
				</div>
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

{#if data.featuredProjects.length > 0}
	<section class="container mx-auto max-w-6xl px-4 py-24 md:py-36">
		<!-- Section header -->
		<div
			use:reveal={{ y: 20, duration: 0.5 }}
			class="flex flex-col justify-between mb-10"
		>
			<p
				class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider"
			>
				Portfolio
			</p>

			<h2 class="text-3xl font-bold">Featured Projects</h2>
		</div>

		<!-- Cards stagger -->
		<div
			use:revealStagger={{ stagger: 0.1, y: 32, delay: 0.1 }}
			class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each data.featuredProjects as project}
				<ProjectCard {project} />
			{/each}
		</div>

		<div class="flex justify-center items-center mt-16">
			<a
				href="/portfolio"
				class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
			>
				<Button variant="outline" size="lg">
					View all
					<ArrowRight size={12} weight="regular" />
				</Button>
			</a>
		</div>
	</section>
{/if}

<!-- ─── Blog Carousel ─────────────────────────────────── -->
{#if data.latestPosts.length > 0}
	<section class="bg-muted/20 border-t">
		<div class="container mx-auto max-w-6xl px-4 py-20">
			<div use:reveal={{ y: 20 }} class="flex items-end justify-between mb-8">
				<div>
					<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">Blog</p>
					<h2 class="text-3xl font-bold">Latest Articles</h2>
				</div>
				<a href="/blog" class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
					View all <ArrowRight class="size-3" />
				</a>
			</div>

			<!-- Carousel reveal dari bawah -->
			<div use:reveal={{ y: 40, duration: 0.6, delay: 150 }}>
				<Carousel.Root opts={{ align: 'start', loop: false }} class="group/carousel w-full">
					<!-- Prev -->
					<div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
						opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200">
						<Carousel.Previous class="static translate-y-0 rounded-full shadow-md cursor-pointer" />
					</div>
					<Carousel.Content class="-ml-4">
						{#each data.latestPosts as post}
							<Carousel.Item class="pl-4 basis-[78%] md:basis-[43%] lg:basis-[30%]">
								<a href="/blog/{post.slug}" class="group block h-full">
									<div use:hoverLift={{ y: -4, duration: 0.18 }} class="flex gap-4 rounded-xl border bg-card h-full
											hover:border-primary/40 hover:bg-muted/30
											transition-all duration-200 hover:shadow-sm"
									>
										<!-- Thumbnail -->
										<div class="shrink-0 w-28 h-28 md:w-24 md:h-24 rounded-tl-lg rounded-bl-lg overflow-hidden bg-muted">
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
										<div class="flex-1 min-w-0 flex flex-col justify-center py-3 pr-3">
											<h3 class="font-medium text-xl md:text-lg leading-snug mb-1
													group-hover:text-primary transition-colors line-clamp-1">
												{post.title}
											</h3>
											<p class="text-xs text-muted-foreground line-clamp-2 hidden sm:block mb-2">
												{post.excerpt ?? ''}
											</p>
											<div class="flex items-center gap-2 text-xs text-muted-foreground">
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
					<!-- Next -->
					<div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
						opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200">
						<Carousel.Next class="static translate-y-0 rounded-full shadow-md cursor-pointer" />
					</div>
				</Carousel.Root>
			</div>
		</div>
	</section>
{/if}

<!-- ─── CTA ───────────────────────────────────────────── -->
<section class="border-t bg-muted/20">
	<div
		use:reveal={{ y: 30, duration: 0.6 }}
		class="container mx-auto max-w-6xl px-4 py-24 text-center"
	>
		<h2 class="text-4xl font-bold mb-4">Let's work together</h2>
		<p class="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
			Open to freelance projects, collaborations, and full-time opportunities.
		</p>
		<Button href="mailto:bbagustrm@gmail.com" size="lg" class="gap-2 rounded-full px-8">
			<Envelope class="size-4" />
			Get in touch
		</Button>
	</div>
</section>
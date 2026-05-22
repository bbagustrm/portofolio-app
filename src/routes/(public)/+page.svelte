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
		Star
	} from 'phosphor-svelte';
	import { formatDateShort, estimateReadingTime, timeAgo } from '$lib/utils';
	import { techStack } from '$lib/data/tech-stack';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Carousel from '$lib/components/ui/carousel';
	import { onMount, onDestroy } from 'svelte';
	import { shouldAnimate } from '$lib/utils/animation';
	import { loadGsap, type GsapBundle } from '$lib/utils/gsap-client';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import ProjectCard from '$lib/components/portfolio/ProjectCard.svelte';
	import { hoverLift } from '$lib/actions/hover';

	let { data } = $props();

	// ── Hero element refs ────────────────────────────────
	//
	// `heroSection` scopes the gsap.context() so any selector-based queries
	// inside the setup callback (and any tween auto-tracked by the context)
	// stay confined to the hero subtree. The other refs are passed directly
	// into `tl.from(...)` calls — null-checked / filtered before use to
	// satisfy Task 7.4.

	let heroSection = $state<HTMLElement | null>(null);
	let heroBadgeMobile = $state<HTMLElement | null>(null);
	let heroBadgeDesktop = $state<HTMLElement | null>(null);
	let heroLine1 = $state<HTMLElement | null>(null);
	let heroLine2 = $state<HTMLElement | null>(null);
	let heroBio = $state<HTMLElement | null>(null);
	let heroButtons = $state<HTMLElement | null>(null);
	let heroSocials = $state<HTMLElement | null>(null);

	// `gsap.context()` return type, sourced from the live bundle so it stays
	// in lockstep with `loadGsap()`. Stored at component scope so onDestroy
	// can revert it. `revert()` cleans up: timeline tweens, ScrollTriggers,
	// and (Task 10.4 / 10.5) any SplitText DOM injection created INSIDE the
	// setup callback — `gsap.context()` automatically tracks SplitText
	// instances constructed within its scope and reverts them as part of
	// `ctx.revert()`.
	type GsapContext = ReturnType<GsapBundle['gsap']['context']>;
	let ctx: GsapContext | undefined;

	// Hero entrance — single onMount that consolidates the three duplicate
	// `onMount` blocks the previous `motion`-based implementation had
	// (Task 7.1 audit: badge × 1, line1 × 3, line2 × 3, bio × 3, buttons × 3,
	// socials × 3 from three duplicate blocks). Per Task 7.7, only ONE
	// tween targeting `heroLine1` runs in the [onMount, onMount + 2s]
	// window after this consolidation.
	onMount(() => {
		// Task 7.6: when reduced-motion is active, skip `loadGsap()` entirely
		// and DO NOT touch initial styles — let the elements render in their
		// default visible state. This matches Requirement 11.1 (hero visible
		// in ≤ 100ms, no fade/slide).
		if (!shouldAnimate()) return;

		loadGsap()
			.then((bundle) => {
				if (!bundle) return;
				const { gsap, SplitText } = bundle;

				// Bail early if the section ref didn't bind (e.g. the
				// component was already torn down between mount and the
				// dynamic-import resolving). Without a scope element the
				// context still works, but we use it as the cleanup root.
				ctx = gsap.context(() => {
					const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

					// Badge — mobile + desktop variants are visibility-toggled
					// by Tailwind breakpoints. Filtering nulls (Task 7.4)
					// also handles the case where one variant isn't rendered
					// (mobile renders only the mobile badge, etc.). When both
					// happen to mount in the DOM (responsive layout shift),
					// they tween together — same offset, same duration.
					const badges = [heroBadgeMobile, heroBadgeDesktop].filter(
						(el): el is HTMLElement => el != null
					);
					if (badges.length > 0) {
						tl.from(badges, { y: 16, opacity: 0, duration: 0.5 });
					}

					// Line 1 — "Bagus Tri". Whole-line fade/slide. Offset
					// `-=0.2` overlaps the tail of the badge tween for a
					// flowing entrance.
					if (heroLine1) {
						tl.from(heroLine1, { y: 40, opacity: 0, duration: 0.7 }, '-=0.2');
					}

					// Line 2 — "Atmojo". Per-character reveal via SplitText
					// (Task 10). The try/catch guards Task 10.2: if SplitText
					// throws (target null, empty text, plugin not registered),
					// we fall back to a whole-line tween so the timeline
					// completes successfully and the name still animates in.
					//
					// Only attempt SplitText when:
					//   - the ref is bound, AND
					//   - the element has trimmed text content (otherwise
					//     SplitText creates zero `chars` and the resulting
					//     `tl.from([], {...})` would be a no-op stagger that
					//     silently shifts subsequent timeline offsets).
					let line2HandledByChars = false;
					const hasLine2Text = heroLine2 != null && (heroLine2.textContent?.trim().length ?? 0) > 0;

					if (hasLine2Text) {
						try {
							const split = new SplitText(heroLine2 as Element, { type: 'chars' });
							if (split.chars && split.chars.length > 0) {
								// Task 10.3 — animate chars with overshoot.
								// `back.out(1.4)` overrides the timeline's
								// `power3.out` default just for this segment.
								tl.from(
									split.chars,
									{
										y: 40,
										opacity: 0,
										stagger: 0.04,
										ease: 'back.out(1.4)'
									},
									'-=0.4'
								);
								line2HandledByChars = true;
							}
						} catch {
							// Fall through to fallback below.
							line2HandledByChars = false;
						}
					}

					// Task 10.2 fallback — also covers the "no text" branch.
					// Same offset (-=0.4) and duration (0.7) as the design
					// spec so the rest of the timeline stays aligned.
					if (!line2HandledByChars && heroLine2) {
						tl.from(heroLine2, { y: 40, opacity: 0, duration: 0.7 }, '-=0.4');
					}

					// Bio paragraph
					if (heroBio) {
						tl.from(heroBio, { y: 24, opacity: 0, duration: 0.5 }, '-=0.3');
					}

					// CTA buttons row
					if (heroButtons) {
						tl.from(heroButtons, { y: 20, opacity: 0, duration: 0.5 }, '-=0.3');
					}

					// Social icons row
					if (heroSocials) {
						tl.from(heroSocials, { y: 16, opacity: 0, duration: 0.5 }, '-=0.4');
					}
				}, heroSection ?? undefined);
			})
			.catch(() => {
				// `loadGsap()` rejected (chunk load / network failure).
				// Per Task 7.6 spirit: leave the DOM in its default,
				// visible state. No initial styles were set, so there's
				// nothing to revert. Swallow the error here — the loader
				// already cleared its memoized cache so a future caller
				// can retry.
			});
	});

	// Task 7.5 — single cleanup hook. `ctx?.revert()` tears down:
	//   • every tween created inside the setup callback (entire timeline)
	//   • any ScrollTriggers added to the context (none in this component,
	//     but future additions are covered automatically)
	//   • the SplitText instance (Task 10.4) — the per-character `<div>`s
	//     SplitText injects into `heroLine2` are removed and the original
	//     `innerHTML` is restored, satisfying Task 10.5 + Requirement 13.5.
	onDestroy(() => {
		ctx?.revert();
		ctx = undefined;
	});
</script>

<svelte:head>
	<title>Atmojo — Full Stack Developer</title>
	<meta name="description" content={data.profile?.bio ?? 'Personal portfolio and blog'} />
</svelte:head>

<!-- ─── Hero ──────────────────────────────────────────── -->
<section bind:this={heroSection} class="relative overflow-hidden">
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl"
		></div>
		<div
			class="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl"
		></div>
	</div>

	<div class="container mx-auto max-w-6xl px-4 py-24 md:py-36">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 lg:flex-row lg:items-start"
		>
			<!-- Left — Name -->
			<div class="w-full lg:w-1/2">
				<!-- Badge — mobile only -->
				<div
					bind:this={heroBadgeMobile}
					class="mb-6 inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground lg:hidden"
				>
					<span class="size-2 animate-pulse rounded-full bg-[#ffd809]"></span>
					Available for opportunities
				</div>

				<h1
					class="text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
				>
					<span bind:this={heroLine1} class="block">Bagus Tri</span>
					<span bind:this={heroLine2} class="block text-primary lg:text-9xl">Atmojo</span>
				</h1>
			</div>

			<!-- Right — Bio + CTA + Socials -->
			<div class="flex w-full flex-col items-start lg:w-1/2">
				<!-- Badge — desktop only -->
				<div
					bind:this={heroBadgeDesktop}
					class="mb-6 hidden w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground lg:inline-flex"
				>
					<span class="size-2 animate-pulse rounded-full bg-[#ffd809]"></span>
					Available for opportunities
				</div>

				<p bind:this={heroBio} class="mb-8 text-lg leading-relaxed text-muted-foreground">
					{data.profile?.bio ??
						'Full Stack Developer passionate about building modern web applications with clean code and great user experiences.'}
				</p>

				<div bind:this={heroButtons} class="mb-10 flex flex-wrap gap-3">
					<a href="/portfolio">
						<Button size="lg" class="gap-2 rounded-full px-6">
							View Portfolio
							<ArrowRight class="size-4" />
						</Button>
					</a>
					<a href="/blog">
						<Button size="lg" variant="outline" class="gap-2 rounded-full px-6">Read Blog</Button>
					</a>
				</div>

				<!-- Social links -->
				<div bind:this={heroSocials}>
					<Tooltip.Provider>
						<div class="flex items-center gap-1">
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<a
											{...props}
											href={data.profile?.github_url ?? 'https://github.com'}
											target="_blank"
											rel="noopener noreferrer"
											class="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
										<a
											{...props}
											href={data.profile?.linkedin_url ?? 'https://linkedin.com'}
											target="_blank"
											rel="noopener noreferrer"
											class="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
										<a
											{...props}
											href="mailto:bbagustrm@gmail.com"
											class="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
<section class="overflow-hidden border-y bg-muted/30">
	<div class="flex items-stretch">
		<!-- Label — static, tidak ikut scroll -->
		<div class="z-10 hidden shrink-0 items-center gap-2 border-r bg-muted/50 px-6 py-4 md:flex">
			<span class="text-sm font-medium whitespace-nowrap text-muted-foreground">
				Tech I work with
			</span>
		</div>

		<!-- Marquee container -->
		<div
			class="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
		>
			<div class="animate-marquee flex w-max gap-10 py-4 pr-10">
				<!-- Render dua kali untuk seamless loop -->
				{#each [...techStack, ...techStack] as tech, i}
					<div
						class="flex shrink-0 items-center gap-2 p-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<img src={tech.logo} alt={tech.name} class="size-8 object-contain" loading="lazy" />
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
		<div use:reveal={{ y: 20, duration: 0.5 }} class="mb-10 flex flex-col justify-between">
			<p class="mb-2 font-sans text-sm font-medium tracking-wider text-primary uppercase">
				Portfolio
			</p>

			<h2 class="text-3xl font-bold">Featured Projects</h2>
		</div>

		<!-- Cards stagger -->
		<div
			use:revealStagger={{ stagger: 0.1, y: 32, delay: 0.1 }}
			class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each data.featuredProjects as project}
				<ProjectCard {project} />
			{/each}
		</div>

		<div class="mt-16 flex items-center justify-center">
			<a
				href="/portfolio"
				class="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
	<section class="border-t bg-muted/20">
		<div class="container mx-auto max-w-6xl px-4 py-20">
			<div use:reveal={{ y: 20 }} class="mb-8 flex items-end justify-between">
				<div>
					<p class="mb-2 font-sans text-sm font-medium tracking-wider text-primary uppercase">
						Blog
					</p>
					<h2 class="text-3xl font-bold">Latest Articles</h2>
				</div>
				<a
					href="/blog"
					class="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					View all <ArrowRight class="size-3" />
				</a>
			</div>

			<!-- Carousel reveal dari bawah -->
			<div use:reveal={{ y: 40, duration: 0.6, delay: 0.15 }}>
				<Carousel.Root opts={{ align: 'start', loop: false }} class="group/carousel w-full">
					<!-- Prev -->
					<div
						class="absolute top-1/2 left-0 z-10 -translate-x-4 -translate-y-1/2
						opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100"
					>
						<Carousel.Previous class="static translate-y-0 cursor-pointer rounded-full shadow-md" />
					</div>
					<Carousel.Content class="-ml-4">
						{#each data.latestPosts as post}
							<Carousel.Item class="basis-[78%] pl-4 md:basis-[43%] lg:basis-[30%]">
								<a href="/blog/{post.slug}" class="group block h-full">
									<div
										use:hoverLift={{ y: -4, duration: 0.18 }}
										class="flex h-full gap-4 rounded-xl border bg-card
											transition-all duration-200
											hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
									>
										<!-- Thumbnail -->
										<div
											class="h-28 w-28 shrink-0 overflow-hidden rounded-tl-lg rounded-bl-lg bg-muted md:h-24 md:w-24"
										>
											{#if post.cover_url}
												<img
													src={post.cover_url}
													alt={post.title}
													class="h-full w-full object-cover"
													loading="lazy"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
												>
													<span class="text-2xl">📝</span>
												</div>
											{/if}
										</div>

										<!-- Content -->
										<div class="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
											<h3
												class="mb-1 line-clamp-1 text-xl leading-snug font-medium
													transition-colors group-hover:text-primary md:text-lg"
											>
												{post.title}
											</h3>
											<p class="mb-2 line-clamp-2 hidden text-xs text-muted-foreground sm:block">
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
					<div
						class="absolute top-1/2 right-0 z-10 translate-x-4 -translate-y-1/2
						opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100"
					>
						<Carousel.Next class="static translate-y-0 cursor-pointer rounded-full shadow-md" />
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
		<h2 class="mb-4 text-4xl font-bold">Let's work together</h2>
		<p class="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
			Open to freelance projects, collaborations, and full-time opportunities.
		</p>
		<Button href="mailto:bbagustrm@gmail.com" size="lg" class="gap-2 rounded-full px-8">
			<Envelope class="size-4" />
			Get in touch
		</Button>
	</div>
</section>

<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import ModeToggle from './ModeToggle.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { List } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { shouldAnimate } from '$lib/utils/animation';
	import * as m from '$paraglide/messages';
	import { revealStagger } from '$lib/actions/reveal';

	let { user = null } = $props<{ user?: any }>();

	let mobileOpen = $state(false);
	let scrolled = $state(false);
	let scrollY = $state(0);

	let links = $derived([
		{ href: '/', label: m.nav_home() },
		{ href: '/portfolio', label: m.nav_portfolio() },
		{ href: '/blog', label: m.nav_blog() },
		{ href: '/gallery', label: m.nav_gallery() }
	]);

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function closeMenu() {
		mobileOpen = false;
	}

	onMount(() => {
		if (!shouldAnimate()) return;

		function handleScroll() {
			scrollY = window.scrollY;
			scrolled = window.scrollY > 20;
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	// Opacity untuk background — makin scroll makin solid
	let bgOpacity = $derived(
		Math.min(scrollY / 80, 1)
	);
</script>

<header
	class="sticky top-0 z-50 w-full transition-all duration-300
		{scrolled ? 'border-b shadow-sm' : 'border-b border-transparent'}"
	style="
		background: oklch(from var(--background) l c h / {scrolled ? Math.min(bgOpacity * 0.95, 0.95) : 0.8});
		backdrop-filter: blur({scrolled ? 16 : 8}px);
	"
>
	<div
		class="container mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300
			{scrolled ? 'h-12' : 'h-16'}"
	>
		<!-- Logo — shrink saat scroll -->

		<a href="/"
		style="view-transition-name: site-logo"
		class="font-semibold tracking-tight hover:opacity-80 transition-all duration-300 font-sans
		{scrolled ? 'text-base' : 'text-xl'}"
		>
		atmojo<span class="text-primary font-bold">.</span>pro
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden md:flex items-center gap-1">
			{#each links as link}

				<a href={link.href}
				class="px-3 py-1.5 text-sm rounded-md transition-colors
				{isActive(link.href)
					? 'text-foreground font-medium bg-muted'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
				>
				{link.label}
				</a>
			{/each}

			{#if user}
				<a href="/dashboard" class="ml-2">
					<Button size="sm">{m.nav_dashboard()}</Button>
				</a>
			{/if}

			<div class="ml-1">
				<LanguageSwitcher />
			</div>
			<div class="ml-1">
				<ModeToggle />
			</div>
		</nav>

		<!-- Mobile -->
		<div class="flex items-center gap-1 md:hidden">
			<ModeToggle />

			<Sheet.Root bind:open={mobileOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" aria-label="Open menu">
							<List class="size-5" />
						</Button>
					{/snippet}
				</Sheet.Trigger>

				<Sheet.Content side="right" class="w-64">
					<Sheet.Header>
						<Sheet.Title class="font-sans text-left">
							atmojo<span class="text-primary font-bold">.</span>pro
						</Sheet.Title>
					</Sheet.Header>

					<Separator class="my-4" />

					<nav use:revealStagger={{ stagger: 0.08, y: 16 }} class="flex flex-col gap-1">
						{#each links as link}

							<a href={link.href}
							onclick={closeMenu}
							class="px-3 py-2 text-sm rounded-md transition-colors
							{isActive(link.href)
								? 'text-foreground font-medium bg-muted'
								: 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
							>
							{link.label}
							</a>
						{/each}

						{#if user}
							<Separator class="my-2" />
							<a href="/dashboard" onclick={closeMenu}>
								<Button size="sm" class="w-full">{m.nav_dashboard()}</Button>
							</a>
						{/if}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<!-- Scroll progress bar -->
	{#if scrolled}
		<div class="absolute bottom-0 left-0 h-[1.5px] bg-primary/50 transition-all duration-100"
		     style="width: {Math.min((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%"
		></div>
	{/if}
</header>
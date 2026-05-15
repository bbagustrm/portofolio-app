<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import ModeToggle from './ModeToggle.svelte';
	import { List } from 'phosphor-svelte';

	let { user = null } = $props<{ user?: any }>();

	let mobileOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/portfolio', label: 'Portfolio' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/gallery', label: 'Gallery' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function closeMenu() {
		mobileOpen = false;
	}
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
	<div class="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

		<!-- Logo -->
		<a 	href="/"
		    class="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity font-sans"
		    style="view-transition-name: site-logo">
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
					<Button size="sm">Dashboard</Button>
				</a>
			{/if}

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
						<Sheet.Title class="font-sans text-left text-lg">
							<p>atmojo<span class="text-primary font-bold">.</span>pro</p>
						</Sheet.Title>
					</Sheet.Header>

					<Separator class="my-4" />

					<nav class="flex flex-col gap-1">
						{#each links as link}

							<a href={link.href}
							onclick={closeMenu}
							class="px-8 py-4 text-lg rounded-none transition-colors
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
								<Button size="sm" class="w-full">Dashboard</Button>
							</a>
						{/if}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>

	</div>
</header>
<script lang="ts">
	import { page } from '$app/state';
	import {
		SquaresFour,
		Kanban,
		Article,
		Images,
		User,
		SignOut,
		List,
		X
	} from 'phosphor-svelte';

	let { user = null } = $props<{ user?: any }>();

	let mobileOpen = $state(false);

	const navLinks = [
		{ href: '/dashboard', label: 'Overview', icon: SquaresFour, exact: true },
		{ href: '/dashboard/projects', label: 'Projects', icon: Kanban, exact: false },
		{ href: '/dashboard/blog', label: 'Blog', icon: Article, exact: false },
		{ href: '/dashboard/gallery', label: 'Gallery', icon: Images, exact: false },
		{ href: '/dashboard/profile', label: 'Profile', icon: User, exact: false }
	];

	function isActive(href: string, exact: boolean): boolean {
		if (exact) return page.url.pathname === href;
		return page.url.pathname.startsWith(href);
	}

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<!-- Mobile top bar -->
<header class="flex items-center justify-between border-b px-4 py-3 md:hidden bg-background">
	<a href="/" class="text-lg font-bold">
		bagus<span class="text-primary">.</span>dev
	</a>
	<button
		onclick={() => (mobileOpen = !mobileOpen)}
		class="p-2 rounded-md hover:bg-muted transition-colors"
		aria-label="Toggle sidebar"
	>
		{#if mobileOpen}
			<X size={20} />
		{:else}
			<List size={20} />
		{/if}
	</button>
</header>

<!-- Sidebar -->
<aside
	class="
		bg-sidebar text-sidebar-foreground border-r
		md:flex md:flex-col md:w-60 md:min-h-screen md:sticky md:top-0 md:max-h-screen
		{mobileOpen ? 'flex flex-col' : 'hidden'}
	"
>
	<!-- Logo (desktop) -->
	<div class="hidden md:flex items-center px-6 h-16 border-b shrink-0">
		<a href="/" class="text-lg font-bold">
			bagus<span class="text-primary">.</span>dev
			<span class="ml-2 text-xs font-normal text-muted-foreground">dashboard</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto p-3 space-y-1">
		{#each navLinks as link}
			{@const Icon = link.icon}
			{@const active = isActive(link.href, link.exact)}

			<a
				href={link.href}
				onclick={closeMobile}
				class="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
				{active
					? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
					: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
			>
				<Icon size={16} class="shrink-0 transition-transform group-hover:scale-110" />
				{link.label}
			</a>
		{/each}
	</nav>

	<!-- Bottom section -->
	<div class="p-3 border-t shrink-0">
		{#if user?.email}
			<div class="px-3 py-2 mb-1">
				<p class="text-xs text-muted-foreground truncate">{user.email}</p>
			</div>
		{/if}

		<form method="POST" action="/logout">
			<button
				type="submit"
				class="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm
				text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
			>
				<SignOut size={16} class="shrink-0" />
				Logout
			</button>
		</form>
	</div>
</aside>
<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import {
		LayoutDashboard, FolderKanban, BookText,
		Images, User, LogOut, ExternalLink
	} from '@lucide/svelte';

	let { user = null } = $props<{ user?: any }>();

	const navLinks = [
		{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
		{ href: '/dashboard/projects', label: 'Projects', icon: FolderKanban, exact: false },
		{ href: '/dashboard/blog', label: 'Blog', icon: BookText, exact: false },
		{ href: '/dashboard/gallery', label: 'Gallery', icon: Images, exact: false },
		{ href: '/dashboard/profile', label: 'Profile', icon: User, exact: false }
	];

	function isActive(href: string, exact: boolean): boolean {
		if (exact) return page.url.pathname === href;
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- Tidak ada Sidebar.Provider di sini -->
<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shrink-0">
								A
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-semibold font-sans text-sm">atmojo.pro</span>
								<span class="text-xs text-muted-foreground">dashboard</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navLinks as link}
						{@const Icon = link.icon}
						{@const active = isActive(link.href, link.exact)}
						<Sidebar.MenuItem>
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Sidebar.MenuButton {...props} isActive={active}>
												{#snippet child({ props: btnProps })}
													<a href={link.href} {...btnProps}>
														<Icon class="size-4" />
														<span>{link.label}</span>
													</a>
												{/snippet}
											</Sidebar.MenuButton>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content side="right">{link.label}</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a href="/" target="_blank" rel="noopener noreferrer" {...props}>
							<ExternalLink class="size-4" />
							<span>View Site</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>

			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<form method="POST" action="/logout" class="w-full">
							<button
								type="submit"
								class="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
								{...props}
							>
								<LogOut class="size-4 shrink-0" />
								<span class="truncate">{user?.email ?? 'Logout'}</span>
							</button>
						</form>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
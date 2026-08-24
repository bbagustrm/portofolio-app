<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Plus, Trash2, Eye, EyeOff, ArrowLeft, LayoutGrid, List } from '@lucide/svelte';
	import { formatDateShort } from '$lib/utils';
	import type { Post } from '$lib/types';
	import { reveal, revealStagger } from '$lib/actions/reveal';

	let { data } = $props();
	let posts = $derived(data.posts);

	type FilterType = 'all' | 'published' | 'unpublished';
	let filter = $state<FilterType>('all');
	let deleteId = $state<string | null>(null);
	let dialogOpen = $state(false);
	let viewMode = $state<'grid' | 'table'>('grid');

	const filterTabs: { value: FilterType; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'published', label: 'Published' },
		{ value: 'unpublished', label: 'Hidden' }
	];

	let filtered = $derived(
		filter === 'all'
			? posts
			: filter === 'published'
				? posts.filter((p: Post) => p.is_published)
				: posts.filter((p: Post) => !p.is_published)
	);

	function getCount(val: FilterType): number {
		if (val === 'all') return posts.length;
		if (val === 'published') return posts.filter((p: Post) => p.is_published).length;
		return posts.filter((p: Post) => !p.is_published).length;
	}
</script>

<svelte:head><title>Gallery — Dashboard</title></svelte:head>

<div class="space-y-6">
	<div use:reveal={{ y: 16 }} class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/dashboard">
				<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
			</a>
			<div>
				<h1 class="text-2xl font-bold">Gallery</h1>
				<p class="text-muted-foreground text-sm mt-0.5">Manage your gallery posts.</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								size="icon"
								onclick={() => (viewMode = viewMode === 'grid' ? 'table' : 'grid')}
							>
								{#if viewMode === 'grid'}
									<List class="size-4" />
								{:else}
									<LayoutGrid class="size-4" />
								{/if}
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>
						Switch to {viewMode === 'grid' ? 'table' : 'grid'} view
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<a href="/dashboard/gallery/new">
				<Button class="gap-2"><Plus class="size-4" />Upload</Button>
			</a>
		</div>
	</div>

	<!-- Filter tabs -->
	<div class="flex gap-2">
		{#each filterTabs as tab}
			<button
				onclick={() => (filter = tab.value)}
				class="px-4 py-1.5 rounded-full text-sm border transition-colors
					{filter === tab.value
						? 'bg-primary text-primary-foreground border-primary'
						: 'hover:bg-muted border-border text-muted-foreground'}"
			>
				{tab.label}
				<span class="ml-1.5 text-xs opacity-70">{getCount(tab.value)}</span>
			</button>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="text-center py-20 text-muted-foreground border rounded-xl">
			<p class="text-4xl mb-4">📷</p>
			<p class="mb-4">No posts here.</p>
			<a href="/dashboard/gallery/new"><Button>Upload your first photo</Button></a>
		</div>

	{:else if viewMode === 'grid'}
		<div use:revealStagger={{ stagger: 0.04, y: 12 }} class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			{#each filtered as post (post.id)}
				{@const firstMedia = post.media?.[0]}
				<div class="group relative rounded-xl overflow-hidden aspect-square bg-muted">
					{#if firstMedia?.type === 'image'}
						<img src={firstMedia.url} alt={post.caption ?? ''} class="w-full h-full object-cover" loading="lazy" />
					{:else if firstMedia?.type === 'video'}
						<video src={firstMedia.url} class="w-full h-full object-cover" muted playsinline preload="metadata">
							<track kind="captions" />
						</video>
					{:else}
						<div class="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
					{/if}

					<div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<form
											method="POST"
											action="?/toggle_published"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
													toast.success('Updated!');
												};
											}}
										>
											<input type="hidden" name="id" value={post.id} />
											<input type="hidden" name="current" value={post.is_published} />
											<button
												{...props}
												type="submit"
												class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
											>
												{#if post.is_published}
													<EyeOff class="size-4" />
												{:else}
													<Eye class="size-4" />
												{/if}
											</button>
										</form>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content>{post.is_published ? 'Hide from gallery' : 'Show in gallery'}</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>

						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<button
											{...props}
											class="p-2 rounded-full bg-red-500/70 hover:bg-red-500 text-white transition-colors"
											onclick={() => { deleteId = post.id; dialogOpen = true; }}
										>
											<Trash2 class="size-4" />
										</button>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content>Delete post</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>

					{#if !post.is_published}
						<div class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
							Hidden
						</div>
					{/if}
					{#if (post.media?.length ?? 0) > 1}
						<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
							⊞ {post.media?.length}
						</div>
					{/if}
				</div>
			{/each}
		</div>

	{:else}
		<div class="border rounded-xl overflow-hidden">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/50">
						<Table.Head>Preview</Table.Head>
						<Table.Head>Caption</Table.Head>
						<Table.Head class="hidden md:table-cell">Media</Table.Head>
						<Table.Head class="hidden lg:table-cell">Date</Table.Head>
						<Table.Head class="text-center">Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as post (post.id)}
						{@const firstMedia = post.media?.[0]}
						<Table.Row class="hover:bg-muted/30 transition-colors">
							<Table.Cell>
								<div class="size-12 rounded-lg overflow-hidden bg-muted">
									{#if firstMedia?.type === 'image'}
										<img src={firstMedia.url} alt="" class="w-full h-full object-cover" />
									{:else if firstMedia?.type === 'video'}
										<div class="w-full h-full flex items-center justify-center text-lg">▶</div>
									{:else}
										<div class="w-full h-full flex items-center justify-center text-lg">🖼️</div>
									{/if}
								</div>
							</Table.Cell>

							<Table.Cell>
								<p class="text-sm line-clamp-2 max-w-xs">
									{post.caption ?? '—'}
								</p>
								{#if post.mood}
									<p class="text-xs text-muted-foreground mt-0.5">feeling {post.mood}</p>
								{/if}
							</Table.Cell>

							<Table.Cell class="hidden md:table-cell">
								<Badge variant="secondary" class="text-xs">
									{post.media?.length ?? 0} file{(post.media?.length ?? 0) !== 1 ? 's' : ''}
								</Badge>
							</Table.Cell>

							<Table.Cell class="hidden lg:table-cell text-muted-foreground text-sm">
								{formatDateShort(post.created_at)}
							</Table.Cell>

							<Table.Cell class="text-center">
								<Badge variant={post.is_published ? 'default' : 'secondary'} class="text-xs">
									{post.is_published ? 'Published' : 'Hidden'}
								</Badge>
							</Table.Cell>

							<Table.Cell>
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props })}
													<form
														method="POST"
														action="?/toggle_published"
														use:enhance={() => {
															return async ({ update }) => {
																await update();
																toast.success('Updated!');
															};
														}}
													>
														<input type="hidden" name="id" value={post.id} />
														<input type="hidden" name="current" value={post.is_published} />
														<button
															{...props}
															type="submit"
															class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
														>
															{#if post.is_published}
																<EyeOff class="size-4 text-muted-foreground" />
															{:else}
																<Eye class="size-4 text-green-500" />
															{/if}
														</button>
													</form>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>{post.is_published ? 'Hide' : 'Show'}</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>

									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="ghost"
														size="icon"
														class="text-destructive hover:text-destructive hover:bg-destructive/10"
														onclick={() => { deleteId = post.id; dialogOpen = true; }}
													>
														<Trash2 class="size-4" />
													</Button>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>Delete post</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Post</Dialog.Title>
			<Dialog.Description>This will permanently delete the post and all its media.</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						dialogOpen = false;
						toast.success('Post deleted.');
					};
				}}
			>
				<input type="hidden" name="id" value={deleteId} />
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus, Trash2, Eye, EyeOff } from '@lucide/svelte';
	import type { Post } from '$lib/types';

	let { data } = $props();
	let posts = $derived(data.posts);

	type FilterType = 'all' | 'published' | 'unpublished';
	let filter = $state<FilterType>('all');
	let deleteId = $state<string | null>(null);
	let dialogOpen = $state(false);

	// Pakai typed object array — hindari destructuring tuple di {#each}
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
</script>

<svelte:head><title>Gallery — Dashboard</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Gallery</h1>
			<p class="text-muted-foreground mt-1">Manage your private gallery posts.</p>
		</div>
		<a href="/dashboard/gallery/new">
			<Button class="gap-2"><Plus class="size-4" />Upload</Button>
		</a>
	</div>

	<!-- Filter tabs — pakai object, bukan tuple destructuring -->
	<div class="flex gap-2">
		{#each filterTabs as tab}
			<button
				onclick={() => (filter = tab.value)}
				class="px-4 py-1.5 rounded-full text-sm border transition-colors
					{filter === tab.value
						? 'bg-primary text-primary-foreground border-primary'
						: 'hover:bg-muted border-border'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="text-center py-20 text-muted-foreground border rounded-xl">
			<p class="text-4xl mb-4">📷</p>
			<p class="mb-4">No posts here.</p>
			<a href="/dashboard/gallery/new"><Button>Upload your first photo</Button></a>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
						<div class="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
					{/if}

					<!-- Overlay actions -->
					<div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
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
								type="submit"
								class="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
								title={post.is_published ? 'Hide' : 'Show'}
							>
								{#if post.is_published}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</button>
						</form>

						<button
							class="p-2 rounded-full bg-red-500/70 hover:bg-red-500 text-white transition-colors"
							onclick={() => { deleteId = post.id; dialogOpen = true; }}
							title="Delete"
						>
							<Trash2 class="size-4" />
						</button>
					</div>

					{#if !post.is_published}
						<div class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
							Hidden
						</div>
					{/if}

					{#if (post.media?.length ?? 0) > 1}
						<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
							⊞ {post.media?.length}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Post</Dialog.Title>
			<Dialog.Description>
				This will permanently delete the post and all its media.
			</Dialog.Description>
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
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus, Pencil, Trash2, Globe } from '@lucide/svelte';
	import { formatDateShort, estimateReadingTime } from '$lib/utils';

	let { data } = $props();
	let posts = $derived(data.posts);

	let deleteId = $state<string | null>(null);
	let deleteTitle = $state('');
	let dialogOpen = $state(false);
</script>

<svelte:head><title>Blog — Dashboard</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Blog</h1>
			<p class="text-muted-foreground mt-1">Manage your blog articles.</p>
		</div>
		<a href="/dashboard/blog/new">
			<Button class="gap-2"><Plus class="size-4" />New Post</Button>
		</a>
	</div>

	{#if posts.length === 0}
		<div class="text-center py-20 text-muted-foreground border rounded-xl">
			<p class="text-4xl mb-4">📝</p>
			<p class="mb-4">No posts yet.</p>
			<a href="/dashboard/blog/new"><Button>Write your first post</Button></a>
		</div>
	{:else}
		<div class="border rounded-xl overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-muted/50 border-b">
				<tr>
					<th class="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
					<th class="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Reading Time</th>
					<th class="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
					<th class="text-center px-4 py-3 font-medium text-muted-foreground">Published</th>
					<th class="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
				</tr>
				</thead>
				<tbody class="divide-y">
				{#each posts as post (post.id)}
					<tr class="hover:bg-muted/30 transition-colors">
						<td class="px-4 py-3">
							<p class="font-medium">{post.title}</p>
							<p class="text-xs text-muted-foreground">
								{formatDateShort(post.published_at ?? post.created_at)}
							</p>
						</td>
						<td class="px-4 py-3 text-muted-foreground hidden md:table-cell">
							{estimateReadingTime(post.content ?? '')}
						</td>
						<td class="px-4 py-3 hidden lg:table-cell">
							<div class="flex gap-1 flex-wrap">
								{#each (post.tags ?? []).slice(0, 2) as tag}
									<Badge variant="outline" class="text-xs">{tag.name}</Badge>
								{/each}
							</div>
						</td>
						<td class="px-4 py-3 text-center">
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
								<button type="submit" class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors" title={post.is_published ? 'Unpublish' : 'Publish'}>
									<Globe class="size-4 {post.is_published ? 'text-green-500' : 'text-muted-foreground'}" />
								</button>
							</form>
						</td>
						<td class="px-4 py-3">
							<div class="flex items-center justify-end gap-1">
								<a href="/dashboard/blog/{post.id}/edit">
									<Button variant="ghost" size="icon" title="Edit">
										<Pencil class="size-4" />
									</Button>
								</a>
								<Button
									variant="ghost" size="icon"
									class="text-destructive hover:text-destructive"
									onclick={() => { deleteId = post.id; deleteTitle = post.title; dialogOpen = true; }}
								>
									<Trash2 class="size-4" />
								</Button>
							</div>
						</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Post</Dialog.Title>
			<Dialog.Description>
				Delete <strong>"{deleteTitle}"</strong>? This cannot be undone.
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
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Plus, Pencil, Trash2, Globe, ArrowLeft } from '@lucide/svelte';
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
		<div class="flex items-center gap-3">
			<a href="/dashboard">
				<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
			</a>
			<div>
				<h1 class="text-2xl font-bold">Blog</h1>
				<p class="text-muted-foreground text-sm mt-0.5">Manage your blog articles.</p>
			</div>
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
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/50">
						<Table.Head>Title</Table.Head>
						<Table.Head class="hidden lg:table-cell">Tags</Table.Head>
						<Table.Head class="hidden md:table-cell">Reading Time</Table.Head>
						<Table.Head class="hidden lg:table-cell">Date</Table.Head>
						<Table.Head class="text-center">Published</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each posts as post (post.id)}
						<Table.Row class="hover:bg-muted/30 transition-colors">
							<Table.Cell>
								<p class="font-medium text-sm line-clamp-1">{post.title}</p>
								{#if post.excerpt}
									<p class="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden sm:block">
										{post.excerpt}
									</p>
								{/if}
							</Table.Cell>

							<Table.Cell class="hidden lg:table-cell">
								<div class="flex gap-1 flex-wrap">
									{#each (post.tags ?? []).slice(0, 2) as tag}
										<Badge variant="outline" class="text-xs">{tag.name}</Badge>
									{/each}
									{#if (post.tags ?? []).length > 2}
										<Badge variant="outline" class="text-xs">+{(post.tags ?? []).length - 2}</Badge>
									{/if}
								</div>
							</Table.Cell>

							<Table.Cell class="hidden md:table-cell text-muted-foreground text-sm">
								{estimateReadingTime(post.content ?? '')}
							</Table.Cell>

							<Table.Cell class="hidden lg:table-cell text-muted-foreground text-sm">
								{formatDateShort(post.published_at ?? post.created_at)}
							</Table.Cell>

							<!-- Toggle Published -->
							<Table.Cell class="text-center">
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
														class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors mx-auto"
													>
														<Globe class="size-4 {post.is_published ? 'text-green-500' : 'text-muted-foreground'}" />
													</button>
												</form>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content>
											{post.is_published ? 'Click to unpublish' : 'Click to publish'}
										</Tooltip.Content>
									</Tooltip.Root>
								</Tooltip.Provider>
							</Table.Cell>

							<!-- Actions -->
							<Table.Cell>
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props })}
													<a href="/dashboard/blog/{post.id}/edit" {...props}>
														<Button variant="ghost" size="icon">
															<Pencil class="size-4" />
														</Button>
													</a>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>Edit post</Tooltip.Content>
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
														onclick={() => {
															deleteId = post.id;
															deleteTitle = post.title;
															dialogOpen = true;
														}}
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

		<p class="text-xs text-muted-foreground text-right">
			{posts.filter((p) => p.is_published).length} of {posts.length} published
		</p>
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
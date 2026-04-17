<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus, Pencil, Trash, Star, Globe } from 'phosphor-svelte';
	import { formatDateShort } from '$lib/utils';

	let { data } = $props();
	let projects = $derived(data.projects);

	let deleteId = $state<string | null>(null);
	let deleteTitle = $state('');
	let dialogOpen = $state(false);
</script>

<svelte:head>
	<title>Projects — Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Projects</h1>
			<p class="text-muted-foreground mt-1">Manage your portfolio projects.</p>
		</div>
		<a href="/dashboard/projects/new">
			<Button class="gap-2">
				<Plus size={16} />
				New Project
			</Button>
		</a>
	</div>

	{#if projects.length === 0}
		<div class="text-center py-20 text-muted-foreground border rounded-xl">
			<p class="text-4xl mb-4">🗂️</p>
			<p class="mb-4">No projects yet.</p>
			<a href="/dashboard/projects/new">
				<Button>Create your first project</Button>
			</a>
		</div>
	{:else}
		<div class="border rounded-xl overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-muted/50 border-b">
				<tr>
					<th class="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
					<th class="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
					<th class="text-center px-4 py-3 font-medium text-muted-foreground">Published</th>
					<th class="text-center px-4 py-3 font-medium text-muted-foreground">Featured</th>
					<th class="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
				</tr>
				</thead>

				<tbody class="divide-y">
				{#each projects as project (project.id)}
					<tr class="hover:bg-muted/30 transition-colors">
						<td class="px-4 py-3">
							<p class="font-medium">{project.title}</p>
							<p class="text-xs text-muted-foreground">{project.slug}</p>
						</td>

						<td class="px-4 py-3 text-muted-foreground hidden md:table-cell">
							{formatDateShort(project.created_at)}
						</td>

						<!-- Published -->
						<td class="px-4 py-3 text-center">
							<form method="POST" action="?/toggle_published" use:enhance={() => {
										return async ({ update }) => {
												await update();
												toast.success('Updated!');
										};
								}}>
								<input type="hidden" name="id" value={project.id} />
								<input type="hidden" name="current" value={project.is_published} />

								<button
									type="submit"
									class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
								>
									<Globe
										size={16}
										class={project.is_published
												? 'text-green-500'
												: 'text-muted-foreground'}
									/>
								</button>
							</form>
						</td>

						<!-- Featured -->
						<td class="px-4 py-3 text-center">
							<form method="POST" action="?/toggle_featured" use:enhance={() => {
										return async ({ update }) => {
												await update();
												toast.success('Updated!');
										};
								}}>
								<input type="hidden" name="id" value={project.id} />
								<input type="hidden" name="current" value={project.is_featured} />

								<button
									type="submit"
									class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors"
								>
									<Star
										size={16}
										weight={project.is_featured ? 'fill' : 'regular'}
										class={project.is_featured
												? 'text-yellow-500'
												: 'text-muted-foreground'}
									/>
								</button>
							</form>
						</td>

						<!-- Actions -->
						<td class="px-4 py-3">
							<div class="flex items-center justify-end gap-1">
								<a href="/dashboard/projects/{project.id}/edit">
									<Button variant="ghost" size="icon">
										<Pencil size={16} />
									</Button>
								</a>

								<Button
									variant="ghost"
									size="icon"
									class="text-destructive hover:text-destructive"
									onclick={() => {
											deleteId = project.id;
											deleteTitle = project.title;
											dialogOpen = true;
										}}
								>
									<Trash size={16} />
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

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Project</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <strong>"{deleteTitle}"</strong>? This cannot be undone.
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
							toast.success('Project deleted.');
					};
			}}
			>
				<input type="hidden" name="id" value={deleteId} />
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
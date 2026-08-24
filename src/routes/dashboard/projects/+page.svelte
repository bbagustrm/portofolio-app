<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Plus, Pencil, Trash2, Star, Globe, ArrowLeft } from '@lucide/svelte';
	import { formatDateShort } from '$lib/utils';
	import { reveal, revealStagger } from '$lib/actions/reveal';
	import { hoverLift } from '$lib/actions/hover';

	let { data } = $props();
	let projects = $derived(data.projects);

	let deleteId = $state<string | null>(null);
	let deleteTitle = $state('');
	let dialogOpen = $state(false);
</script>

<svelte:head><title>Projects — Dashboard</title></svelte:head>

<div class="space-y-6">
	<div use:reveal={{ y: 16 }} class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/dashboard">
				<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
			</a>
			<div>
				<h1 class="text-2xl font-bold">Projects</h1>
				<p class="text-muted-foreground text-sm mt-0.5">Manage your portfolio projects.</p>
			</div>
		</div>
		<a href="/dashboard/projects/new">
			<Button class="gap-2"><Plus class="size-4" />New Project</Button>
		</a>
	</div>

	{#if projects.length === 0}
		<div class="text-center py-20 text-muted-foreground border rounded-xl">
			<p class="text-4xl mb-4">🗂️</p>
			<p class="mb-4">No projects yet.</p>
			<a href="/dashboard/projects/new"><Button>Create your first project</Button></a>
		</div>
	{:else}
		<div class="border rounded-xl overflow-hidden">
			<Table.Root>
				<Table.Header>
					<Table.Row class="bg-muted/50">
						<Table.Head>Title</Table.Head>
						<Table.Head class="hidden md:table-cell">Tech Stack</Table.Head>
						<Table.Head class="hidden lg:table-cell">Date</Table.Head>
						<Table.Head class="text-center">Published</Table.Head>
						<Table.Head class="text-center">Featured</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each projects as project (project.id)}
						<Table.Row class="hover:bg-muted/30 transition-colors">
							<Table.Cell>
								<p class="font-medium text-sm">{project.title}</p>
								<p class="text-xs text-muted-foreground mt-0.5 hidden sm:block">{project.slug}</p>
							</Table.Cell>

							<Table.Cell class="hidden md:table-cell">
								<div class="flex flex-wrap gap-1">
									{#each project.tech_stack.slice(0, 3) as tech}
										<Badge variant="secondary" class="text-xs">{tech}</Badge>
									{/each}
									{#if project.tech_stack.length > 3}
										<Badge variant="outline" class="text-xs">+{project.tech_stack.length - 3}</Badge>
									{/if}
								</div>
							</Table.Cell>

							<Table.Cell class="hidden lg:table-cell text-muted-foreground text-sm">
								{formatDateShort(project.created_at)}
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
													<input type="hidden" name="id" value={project.id} />
													<input type="hidden" name="current" value={project.is_published} />
													<button
														{...props}
														type="submit"
														class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors mx-auto"
													>
														<Globe class="size-4 {project.is_published ? 'text-green-500' : 'text-muted-foreground'}" />
													</button>
												</form>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content>
											{project.is_published ? 'Click to unpublish' : 'Click to publish'}
										</Tooltip.Content>
									</Tooltip.Root>
								</Tooltip.Provider>
							</Table.Cell>

							<!-- Toggle Featured -->
							<Table.Cell class="text-center">
								<Tooltip.Provider>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<form
													method="POST"
													action="?/toggle_featured"
													use:enhance={() => {
														return async ({ update }) => {
															await update();
															toast.success('Updated!');
														};
													}}
												>
													<input type="hidden" name="id" value={project.id} />
													<input type="hidden" name="current" value={project.is_featured} />
													<button
														{...props}
														type="submit"
														class="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors mx-auto"
													>
														<Star class="size-4 {project.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}" />
													</button>
												</form>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content>
											{project.is_featured ? 'Remove from featured' : 'Mark as featured'}
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
													<a href="/dashboard/projects/{project.id}/edit" {...props}>
														<Button variant="ghost" size="icon">
															<Pencil class="size-4" />
														</Button>
													</a>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>Edit project</Tooltip.Content>
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
															deleteId = project.id;
															deleteTitle = project.title;
															dialogOpen = true;
														}}
													>
														<Trash2 class="size-4" />
													</Button>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>Delete project</Tooltip.Content>
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
			{projects.filter((p) => p.is_published).length} of {projects.length} published
		</p>
	{/if}
</div>

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
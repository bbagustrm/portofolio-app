<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Upload } from 'phosphor-svelte';
	import RichTextEditor from '$lib/components/blog/RichTextEditor.svelte';

	let { data, form } = $props();
	let project = $derived(data.project);

	let loading = $state(false);
	let coverPreview = $state<string | null>(null);

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	function onCoverChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) coverPreview = URL.createObjectURL(file);
	}
</script>

<svelte:head>
	<title>Edit Project — Dashboard</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/projects">
			<Button variant="ghost" size="icon">
				<ArrowLeft size={16} />
			</Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">Edit Project</h1>
			<p class="text-muted-foreground text-sm">{project.title}</p>
		</div>
	</div>

	<form
		method="POST"
		action="?/update"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
				toast.success('Project updated!');
			};
		}}
		class="space-y-6"
	>
		<Card>
			<CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input id="title" name="title" value={project.title} required />
				</div>

				<div class="space-y-2">
					<Label for="description">Short Description</Label>
					<Textarea id="description" name="description" value={project.description ?? ''} rows={2} />
				</div>

				<div class="space-y-2">
					<Label for="content">Detail Content</Label>
					<RichTextEditor name="content" content={project.content ?? ''} />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				{#if coverPreview || project.cover_url}
					<div class="aspect-video rounded-lg overflow-hidden border">
						<img
							src={coverPreview ?? project.cover_url}
							alt="Cover"
							class="w-full h-full object-cover"
						/>
					</div>
				{/if}

				<label class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
					<Upload size={20} class="text-muted-foreground" />
					<span class="text-sm text-muted-foreground">Click to change cover image</span>
					<input
						type="file"
						name="cover"
						accept="image/jpeg,image/png,image/webp"
						class="hidden"
						onchange={onCoverChange}
					/>
				</label>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Links & Tech</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="tech_stack">Tech Stack (comma separated)</Label>
					<Input id="tech_stack" name="tech_stack" value={project.tech_stack.join(', ')} />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="demo_url">Demo URL</Label>
						<Input id="demo_url" name="demo_url" type="url" value={project.demo_url ?? ''} />
					</div>
					<div class="space-y-2">
						<Label for="repo_url">Repository URL</Label>
						<Input id="repo_url" name="repo_url" type="url" value={project.repo_url ?? ''} />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
			<CardContent class="space-y-3">
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_published" class="size-4 rounded" checked={project.is_published} />
					<div>
						<p class="text-sm font-medium">Published</p>
						<p class="text-xs text-muted-foreground">Visible on public portfolio page</p>
					</div>
				</label>

				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_featured" class="size-4 rounded" checked={project.is_featured} />
					<div>
						<p class="text-sm font-medium">Featured</p>
						<p class="text-xs text-muted-foreground">Show on landing page</p>
					</div>
				</label>
			</CardContent>
		</Card>

		<div class="flex gap-3">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Save Changes'}
			</Button>

			<a href="/dashboard/projects">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
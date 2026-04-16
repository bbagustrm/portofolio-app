<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Upload } from 'phosphor-svelte';
	import { generateSlug } from '$lib/utils/slug';

	let { form } = $props();

	let loading = $state(false);
	let title = $state('');
	let slug = $state('');
	let coverPreview = $state<string | null>(null);

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	function onTitleInput(e: Event) {
		title = (e.target as HTMLInputElement).value;
		slug = generateSlug(title);
	}

	function onCoverChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		coverPreview = URL.createObjectURL(file);
	}
</script>

<svelte:head>
	<title>New Project — Dashboard</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/projects">
			<Button variant="ghost" size="icon">
				<ArrowLeft size={16} />
			</Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">New Project</h1>
			<p class="text-muted-foreground text-sm">Add a new portfolio project.</p>
		</div>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
		class="space-y-6"
	>
		<Card>
			<CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input
						id="title"
						name="title"
						placeholder="My Awesome Project"
						required
						oninput={onTitleInput}
					/>
				</div>

				<div class="space-y-2">
					<Label for="slug">Slug (auto-generated)</Label>
					<Input
						id="slug"
						name="slug"
						value={slug}
						placeholder="my-awesome-project"
						class="text-muted-foreground"
						readonly
					/>
				</div>

				<div class="space-y-2">
					<Label for="description">Short Description</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="A brief description of the project..."
						rows={2}
					/>
				</div>

				<div class="space-y-2">
					<Label for="content">Detail Content</Label>
					<Textarea
						id="content"
						name="content"
						placeholder="Full description, features, challenges..."
						rows={6}
					/>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				{#if coverPreview}
					<div class="aspect-video rounded-lg overflow-hidden border">
						<img src={coverPreview} alt="Cover preview" class="w-full h-full object-cover" />
					</div>
				{/if}

				<label class="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors">
					<Upload size={24} class="text-muted-foreground" />
					<span class="text-sm text-muted-foreground">
						{coverPreview ? 'Change image' : 'Click to upload cover image'}
					</span>
					<span class="text-xs text-muted-foreground">
						JPEG, PNG, WebP — max 10MB
					</span>
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
					<Label for="tech_stack">Tech Stack</Label>
					<Input
						id="tech_stack"
						name="tech_stack"
						placeholder="SvelteKit, TypeScript, PostgreSQL (comma separated)"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="demo_url">Demo URL</Label>
						<Input id="demo_url" name="demo_url" type="url" placeholder="https://..." />
					</div>
					<div class="space-y-2">
						<Label for="repo_url">Repository URL</Label>
						<Input id="repo_url" name="repo_url" type="url" placeholder="https://github.com/..." />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
			<CardContent class="space-y-3">
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_published" class="size-4 rounded" />
					<div>
						<p class="text-sm font-medium">Published</p>
						<p class="text-xs text-muted-foreground">Visible on public portfolio page</p>
					</div>
				</label>

				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_featured" class="size-4 rounded" />
					<div>
						<p class="text-sm font-medium">Featured</p>
						<p class="text-xs text-muted-foreground">Show on landing page</p>
					</div>
				</label>
			</CardContent>
		</Card>

		<div class="flex gap-3">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Create Project'}
			</Button>

			<a href="/dashboard/projects">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
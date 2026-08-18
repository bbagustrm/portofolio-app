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
	import RichTextEditor from '$lib/components/blog/RichTextEditor.svelte';

	let { form } = $props();

	let loading = $state(false);
	let titleEn = $state('');
	let slugEn = $state('');
	let titleId = $state('');
	let slugId = $state('');
	let coverPreview = $state<string | null>(null);

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	function onTitleInputEn(e: Event) {
		titleEn = (e.target as HTMLInputElement).value;
		slugEn = generateSlug(titleEn);
	}

	function onTitleInputId(e: Event) {
		titleId = (e.target as HTMLInputElement).value;
		slugId = generateSlug(titleId) + '-id';
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

<div class="max-w-7xl mx-auto space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/projects">
			<Button variant="ghost" size="icon">
				<ArrowLeft size={16} />
			</Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">New Project (Bilingual)</h1>
			<p class="text-muted-foreground text-sm">Create English and Indonesian versions simultaneously.</p>
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
		<!-- Split Screen Layout: EN (Left) | ID (Right) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- ENGLISH VERSION -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						🇬🇧 English Version
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="title_en">Title (EN) *</Label>
						<Input
							id="title_en"
							name="title_en"
							placeholder="My Awesome Project"
							required
							oninput={onTitleInputEn}
						/>
					</div>

					<div class="space-y-2">
						<Label for="slug_en">Slug (auto-generated)</Label>
						<Input
							id="slug_en"
							name="slug_en"
							value={slugEn}
							placeholder="my-awesome-project"
							class="text-muted-foreground"
							readonly
						/>
					</div>

					<div class="space-y-2">
						<Label for="description_en">Short Description (EN)</Label>
						<Textarea
							id="description_en"
							name="description_en"
							placeholder="A brief description of the project..."
							rows={2}
						/>
					</div>

					<div class="space-y-2">
						<Label for="content_en">Detail Content (EN)</Label>
						<RichTextEditor name="content_en" />
					</div>
				</CardContent>
			</Card>

			<!-- INDONESIAN VERSION -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						🇮🇩 Indonesian Version
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="title_id">Judul (ID) *</Label>
						<Input
							id="title_id"
							name="title_id"
							placeholder="Proyek Keren Saya"
							required
							oninput={onTitleInputId}
						/>
					</div>

					<div class="space-y-2">
						<Label for="slug_id">Slug (auto-generated)</Label>
						<Input
							id="slug_id"
							name="slug_id"
							value={slugId}
							placeholder="proyek-keren-saya-id"
							class="text-muted-foreground"
							readonly
						/>
					</div>

					<div class="space-y-2">
						<Label for="description_id">Deskripsi Singkat (ID)</Label>
						<Textarea
							id="description_id"
							name="description_id"
							placeholder="Deskripsi singkat tentang proyek..."
							rows={2}
						/>
					</div>

					<div class="space-y-2">
						<Label for="content_id">Konten Detail (ID)</Label>
						<RichTextEditor name="content_id" />
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Cover Image (Shared) -->
		<Card>
			<CardHeader><CardTitle>Cover Image (Shared for both languages)</CardTitle></CardHeader>
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

		<!-- Links & Tech (Shared) -->
		<Card>
			<CardHeader><CardTitle>Links & Tech Stack (Shared for both languages)</CardTitle></CardHeader>
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
				{loading ? 'Creating both versions...' : 'Create EN & ID Projects'}
			</Button>

			<a href="/dashboard/projects">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Upload } from '@lucide/svelte';
	import { generateSlug } from '$lib/utils/slug';
	import RichTextEditor from '$lib/components/blog/RichTextEditor.svelte';

	let { data, form } = $props();

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
		if (file) coverPreview = URL.createObjectURL(file);
	}
</script>

<svelte:head><title>New Post — Dashboard</title></svelte:head>

<div class="max-w-3xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/blog">
			<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">New Post</h1>
			<p class="text-muted-foreground text-sm">Write a new blog article.</p>
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
			<CardHeader><CardTitle>Article Info</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input id="title" name="title" placeholder="My Article Title" required oninput={onTitleInput} />
				</div>

				<div class="space-y-2">
					<Label>Slug (auto-generated)</Label>
					<Input value={slug} readonly class="text-muted-foreground" />
					<input type="hidden" name="slug" value={slug} />
				</div>

				<div class="space-y-2">
					<Label for="excerpt">Excerpt (optional)</Label>
					<Textarea id="excerpt" name="excerpt" placeholder="Short summary shown in blog list..." rows={2} />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Content</CardTitle></CardHeader>
			<CardContent>
				<RichTextEditor />
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
				<label class="flex flex-col items-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors">
					<Upload class="size-6 text-muted-foreground" />
					<span class="text-sm text-muted-foreground">Click to upload cover image</span>
					<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" class="hidden" onchange={onCoverChange} />
				</label>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Tags & Visibility</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="tags">Tags (comma separated)</Label>
					<Input id="tags" name="tags" placeholder="svelte, webdev, tutorial" />
				</div>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_published" class="size-4 rounded" />
					<div>
						<p class="text-sm font-medium">Publish immediately</p>
						<p class="text-xs text-muted-foreground">Uncheck to save as draft</p>
					</div>
				</label>
			</CardContent>
		</Card>

		<div class="flex gap-3">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Create Post'}
			</Button>
			<a href="/dashboard/blog">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
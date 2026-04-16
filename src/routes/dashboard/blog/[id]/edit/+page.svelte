<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Upload } from '@lucide/svelte';
	import RichTextEditor from '$lib/components/blog/RichTextEditor.svelte';

	let { data, form } = $props();
	let post = $derived(data.post);

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

<svelte:head><title>Edit Post — Dashboard</title></svelte:head>

<div class="max-w-3xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/blog">
			<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">Edit Post</h1>
			<p class="text-muted-foreground text-sm">{post.title}</p>
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
				toast.success('Post updated!');
			};
		}}
		class="space-y-6"
	>
		<Card>
			<CardHeader><CardTitle>Article Info</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">Title *</Label>
					<Input id="title" name="title" value={post.title} required />
				</div>
				<div class="space-y-2">
					<Label for="excerpt">Excerpt</Label>
					<Textarea id="excerpt" name="excerpt" value={post.excerpt ?? ''} rows={2} />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Content</CardTitle></CardHeader>
			<CardContent>
				<RichTextEditor content={post.content ?? ''} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				{#if coverPreview || post.cover_url}
					<div class="aspect-video rounded-lg overflow-hidden border">
						<img src={coverPreview ?? post.cover_url} alt="Cover" class="w-full h-full object-cover" />
					</div>
				{/if}
				<label class="flex flex-col items-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
					<Upload class="size-5 text-muted-foreground" />
					<span class="text-sm text-muted-foreground">Click to change cover</span>
					<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" class="hidden" onchange={onCoverChange} />
				</label>
			</CardContent>
		</Card>

		<Card>
			<CardHeader><CardTitle>Tags & Visibility</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="tags">Tags (comma separated)</Label>
					<Input
						id="tags"
						name="tags"
						value={(post.tags ?? []).map((t) => t.name).join(', ')}
						placeholder="svelte, webdev, tutorial"
					/>
				</div>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_published" class="size-4 rounded" checked={post.is_published} />
					<div>
						<p class="text-sm font-medium">Published</p>
						<p class="text-xs text-muted-foreground">Visible to public</p>
					</div>
				</label>
			</CardContent>
		</Card>

		<div class="flex gap-3">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Save Changes'}
			</Button>
			<a href="/dashboard/blog">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
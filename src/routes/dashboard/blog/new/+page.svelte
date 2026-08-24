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
	import { reveal, revealStagger } from '$lib/actions/reveal';

	let { data, form } = $props();

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
		if (file) coverPreview = URL.createObjectURL(file);
	}
</script>

<svelte:head><title>New Post — Dashboard</title></svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
	<div use:reveal={{ y: 16 }} class="flex items-center gap-3">
		<a href="/dashboard/blog">
			<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">New Post (Bilingual)</h1>
			<p class="text-muted-foreground text-sm">Write English and Indonesian articles simultaneously.</p>
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
		use:revealStagger={{ stagger: 0.1, y: 20 }}
		class="space-y-6"
	>
		<!-- Split Screen Layout: EN (Left) | ID (Right) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- ENGLISH VERSION -->
			<Card>
				<CardHeader><CardTitle class="flex items-center gap-2">🇬🇧 English Article</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="title_en">Title (EN) *</Label>
						<Input id="title_en" name="title_en" placeholder="My Article Title" required oninput={onTitleInputEn} />
					</div>

					<div class="space-y-2">
						<Label>Slug (auto-generated)</Label>
						<Input value={slugEn} readonly class="text-muted-foreground" />
						<input type="hidden" name="slug_en" value={slugEn} />
					</div>

					<div class="space-y-2">
						<Label for="excerpt_en">Excerpt (EN)</Label>
						<Textarea id="excerpt_en" name="excerpt_en" placeholder="Short summary..." rows={2} />
					</div>
				</CardContent>
			</Card>

			<!-- INDONESIAN VERSION -->
			<Card>
				<CardHeader><CardTitle class="flex items-center gap-2">🇮🇩 Artikel Indonesia</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="title_id">Judul (ID) *</Label>
						<Input id="title_id" name="title_id" placeholder="Judul Artikel Saya" required oninput={onTitleInputId} />
					</div>

					<div class="space-y-2">
						<Label>Slug (auto-generated)</Label>
						<Input value={slugId} readonly class="text-muted-foreground" />
						<input type="hidden" name="slug_id" value={slugId} />
					</div>

					<div class="space-y-2">
						<Label for="excerpt_id">Kutipan (ID)</Label>
						<Textarea id="excerpt_id" name="excerpt_id" placeholder="Ringkasan singkat..." rows={2} />
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Content (Split Screen) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader><CardTitle>Content (EN)</CardTitle></CardHeader>
				<CardContent>
					<RichTextEditor name="content_en" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader><CardTitle>Konten (ID)</CardTitle></CardHeader>
				<CardContent>
					<RichTextEditor name="content_id" />
				</CardContent>
			</Card>
		</div>

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
				{loading ? 'Creating both versions...' : 'Create EN & ID Posts'}
			</Button>
			<a href="/dashboard/blog">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
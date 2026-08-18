<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, Upload, X } from '@lucide/svelte';

	let { form } = $props();

	let loading = $state(false);
	let previews = $state<{ url: string; type: 'image' | 'video'; name: string }[]>([]);

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});

	function onFilesChange(e: Event) {
		const files = Array.from((e.target as HTMLInputElement).files ?? []);
		previews = files.map((file) => ({
			url: URL.createObjectURL(file),
			type: file.type.startsWith('video') ? 'video' : 'image',
			name: file.name
		}));
	}

	function removePreview(index: number) {
		previews = previews.filter((_, i) => i !== index);
	}
</script>

<svelte:head><title>Upload — Dashboard</title></svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/gallery">
			<Button variant="ghost" size="icon"><ArrowLeft class="size-4" /></Button>
		</a>
		<div>
			<h1 class="text-2xl font-bold">Upload (Bilingual Captions)</h1>
			<p class="text-muted-foreground text-sm">Add media with EN & ID captions simultaneously.</p>
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
		<!-- Upload zone -->
		<Card>
			<CardHeader><CardTitle>Media Files</CardTitle></CardHeader>
			<CardContent class="space-y-4">
				<label class="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
					<Upload class="size-8 text-muted-foreground" />
					<div class="text-center">
						<p class="text-sm font-medium">Click to select files</p>
						<p class="text-xs text-muted-foreground mt-1">
							Images (JPEG, PNG, WebP — max 10MB) · Videos (MP4, WebM — max 100MB)
						</p>
					</div>
					<input
						type="file"
						name="media"
						accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
						multiple
						class="hidden"
						onchange={onFilesChange}
					/>
				</label>

				<!-- Previews -->
				{#if previews.length > 0}
					<div class="grid grid-cols-3 gap-2">
						{#each previews as preview, i}
							<div class="relative aspect-square rounded-lg overflow-hidden bg-muted group">
								{#if preview.type === 'image'}
									<img src={preview.url} alt={preview.name} class="w-full h-full object-cover" />
								{:else}
									<video src={preview.url} class="w-full h-full object-cover" muted playsinline preload="metadata">
										<track kind="captions" />
									</video>
									<div class="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
										VIDEO
									</div>
								{/if}
								<button
									type="button"
									onclick={() => removePreview(i)}
									class="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
								>
									<X class="size-3" />
								</button>
							</div>
						{/each}
					</div>
					<p class="text-xs text-muted-foreground">{previews.length} file(s) selected</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Captions (Split Screen) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<Card>
				<CardHeader><CardTitle>🇬🇧 English Details</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="caption_en">Caption (EN)</Label>
						<Textarea id="caption_en" name="caption_en" placeholder="What's this about?" rows={3} />
					</div>
					<div class="space-y-2">
						<Label for="mood_en">Mood (EN)</Label>
						<Input id="mood_en" name="mood_en" placeholder="e.g. happy, calm, nostalgic" />
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader><CardTitle>🇮🇩 Detail Indonesia</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="caption_id">Keterangan (ID)</Label>
						<Textarea id="caption_id" name="caption_id" placeholder="Tentang apa ini?" rows={3} />
					</div>
					<div class="space-y-2">
						<Label for="mood_id">Mood (ID)</Label>
						<Input id="mood_id" name="mood_id" placeholder="misal: senang, tenang, nostalgia" />
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Visibility (Shared) -->
		<Card>
			<CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
			<CardContent>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" name="is_published" class="size-4 rounded" checked />
					<div>
						<p class="text-sm font-medium">Publish immediately</p>
						<p class="text-xs text-muted-foreground">Visible on public gallery page</p>
					</div>
				</label>
			</CardContent>
		</Card>

		<div class="flex gap-3">
			<Button type="submit" disabled={loading || previews.length === 0}>
				{loading ? 'Uploading...' : `Upload (creates EN & ID posts)`}
			</Button>
			<a href="/dashboard/gallery">
				<Button variant="outline" type="button">Cancel</Button>
			</a>
		</div>
	</form>
</div>
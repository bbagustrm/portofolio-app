<script lang="ts">
	import { ArrowLeft } from 'phosphor-svelte';
	import { formatDate } from '$lib/utils';
	import type { Media } from '$lib/types';

	let { data } = $props();
	let post = $derived(data.post);

	let activeIndex = $state(0);
	let media = $derived(post.media ?? []);
	let active = $derived(media[activeIndex]);
</script>

<svelte:head>
	<title>{post.caption ? post.caption.slice(0, 50) : 'Gallery'} — Bagus</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-16">
	<a href="/gallery" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
		<ArrowLeft size={16} weight="regular" />
		Back to Gallery
	</a>

	<!-- Main media viewer -->
	<div class="rounded-2xl overflow-hidden bg-muted mb-4 aspect-square sm:aspect-video">
		{#if active?.type === 'image'}
			<img
				src={active.url}
				alt={post.caption ?? ''}
				class="w-full h-full object-contain"
			/>
		{:else if active?.type === 'video'}
			<video
				src={active.url}
				class="w-full h-full object-contain"
				controls
				playsinline
			>
				<track kind="captions" />
			</video>
		{/if}
	</div>

	<!-- Thumbnails (if multiple) -->
	{#if media.length > 1}
		<div class="flex gap-2 overflow-x-auto pb-2 mb-6">
			{#each media as item, i}
				<button
					onclick={() => (activeIndex = i)}
					class="shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors
						{i === activeIndex ? 'border-primary' : 'border-transparent'}"
				>
					{#if item.type === 'image'}
						<img src={item.url} alt="" class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full bg-muted flex items-center justify-center text-xs">▶</div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Caption & meta -->
	<div class="space-y-2">
		{#if post.caption}
			<p class="text-lg">{post.caption}</p>
		{/if}
		<p class="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
	</div>
</div>
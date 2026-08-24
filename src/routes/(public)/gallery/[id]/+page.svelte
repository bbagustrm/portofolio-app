<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { formatDate } from '$lib/utils';
	import * as m from '$paraglide/messages';
	import { reveal, revealStagger } from '$lib/actions/reveal';

	let { data } = $props();
	let post = $derived(data.post);
	let media = $derived(post.media ?? []);
	let activeIndex = $state(0);
	let active = $derived(media[activeIndex]);
</script>

<svelte:head>
	<title>{post.caption ? post.caption.slice(0, 50) + '...' : 'Photo'} — Gallery</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-16">

	<a href="/gallery"
	class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
	>
	<ArrowLeft class="size-4" />
	{m.common_back_to_gallery()}
	</a>

	<!-- Main viewer -->
	<div
		use:reveal={{ y: 20, scale: 0.98 }}
		class="rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 mb-4 border"
	>
		{#if active?.type === 'image'}
			<img
				src={active.url}
				alt={post.caption ?? ''}
				class="w-full max-h-[70vh] object-contain"
			/>
		{:else if active?.type === 'video'}
			<video
				src={active.url}
				class="w-full max-h-[70vh]"
				controls
				playsinline
			>
				<track kind="captions" />
			</video>
		{/if}
	</div>

	<!-- Thumbnails -->
	{#if media.length > 1}
		<div use:revealStagger={{ stagger: 0.05 }} class="flex gap-2 overflow-x-auto pb-2 mb-6">
			{#each media as item, i}
				<button
					onclick={() => (activeIndex = i)}
					class="shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors
						{i === activeIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}"
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
	<div class="space-y-2 mt-4">
		{#if post.caption}
			<p class="text-base">{post.caption}</p>
		{/if}
		<p class="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
	</div>
</div>
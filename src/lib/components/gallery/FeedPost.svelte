<script lang="ts">
	import { timeAgo } from '$lib/utils';
	import type { Post } from '$lib/types';

	let { post } = $props<{ post: Post }>();

	let firstMedia = $derived(post.media?.[0]);
	let mediaCount = $derived(post.media?.length ?? 0);
</script>

<a href="/gallery/{post.id}" class="group block">
	<div class="relative overflow-hidden rounded-xl bg-muted aspect-square">
		{#if firstMedia}
			{#if firstMedia.type === 'image'}
				<img
					src={firstMedia.url}
					alt={post.caption ?? ''}
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			{:else if firstMedia.type === 'video'}
				<video
					src={firstMedia.url}
					class="w-full h-full object-cover"
					muted
					playsinline
					preload="metadata"
				>
					<track kind="captions" />
				</video>
				<!-- Video icon indicator -->
				<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
					▶ Video
				</div>
			{/if}
		{:else}
			<div class="w-full h-full flex items-center justify-center text-muted-foreground">
				<span class="text-4xl">🖼️</span>
			</div>
		{/if}

		<!-- Multiple media indicator -->
		{#if mediaCount > 1}
			<div class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
				⊞ {mediaCount}
			</div>
		{/if}

		<!-- Hover overlay -->
		<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end">
			{#if post.caption}
				<div class="translate-y-full group-hover:translate-y-0 transition-transform duration-200 p-3 w-full">
					<p class="text-white text-sm line-clamp-2">{post.caption}</p>
					<p class="text-white/60 text-xs mt-1">{timeAgo(post.created_at)}</p>
				</div>
			{/if}
		</div>
	</div>
</a>
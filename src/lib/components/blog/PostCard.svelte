<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { formatDateShort, estimateReadingTime } from '$lib/utils';
	import type { BlogPost } from '$lib/types';

	let { post } = $props<{ post: BlogPost }>();
</script>

<a href="/blog/{post.slug}" class="group block h-full">
	<Card class="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
		{#if post.cover_url}
			<div class="aspect-video overflow-hidden">
				<img
					src={post.cover_url}
					alt={post.title}
					class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			</div>
		{:else}
			<div class="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
				<span class="text-3xl">📝</span>
			</div>
		{/if}

		<CardContent class="p-5 flex flex-col gap-3">
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
				<span>·</span>
				<span>{estimateReadingTime(post.content ?? '')}</span>
			</div>

			<div>
				<h3 class="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
					{post.title}
				</h3>
				<p class="text-sm text-muted-foreground line-clamp-3">
					{post.excerpt ?? ''}
				</p>
			</div>

			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-1 mt-auto">
					{#each post.tags.slice(0, 3) as tag}
						<Badge variant="outline" class="text-xs">{tag.name}</Badge>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</a>
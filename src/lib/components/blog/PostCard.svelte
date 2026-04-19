<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { formatDateShort, estimateReadingTime } from '$lib/utils';
	import type { BlogPost } from '$lib/types';

	let { post, variant = 'default' } = $props<{
		post: BlogPost;
		variant?: 'default' | 'featured'
	}>();

</script>
{#if variant === 'featured'}
	<a href="/blog/{post.slug}" class="group block">
		<div class="space-y-3 py-2 border-b">
			<!-- Title -->
			<h3 class="font-medium text-md leading-snug line-clamp-3 group-hover:text-primary transition-colors">
				{post.title}
			</h3>

			<!-- Excerpt -->
			{#if post.excerpt}
				<p class="text-sm text-muted-foreground line-clamp-3">
					{post.excerpt}
				</p>
			{/if}

			<!-- Meta -->
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
				<span>·</span>
				<span>{estimateReadingTime(post.content ?? '')}</span>
			</div>

		</div>
	</a>

{:else}
	<!-- Default — list item horizontal -->
	<a href="/blog/{post.slug}" class="group block">
		<div class="flex gap-4 md:gap-6 py-4 border-b last:border-0 transition-colors hover:bg-muted/30 -mx-3 px-3 rounded-lg">
			<!-- Thumbnail -->
			<div class="shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-lg overflow-hidden bg-muted">
				{#if post.cover_url}
					<img
						src={post.cover_url}
						alt={post.title}
						class="w-full h-full object-cover"
						loading="lazy"
					/>
				{:else}
					<div class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
						<span class="text-2xl">📝</span>
					</div>
				{/if}
			</div>

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<!-- Tags — pakai Badge seperti featured -->
				{#if post.tags && post.tags.length > 0}
					<div class="flex flex-wrap gap-1 mb-2">
						{#each post.tags.slice(0, 2) as tag}
							<Badge variant="secondary" class="text-xs">{tag.name}</Badge>
						{/each}
					</div>
				{/if}

				<h3 class="font-medium text-xl leading-snug mb-1
					group-hover:text-primary transition-colors line-clamp-2">
					{post.title}
				</h3>

				<p class="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
					{post.excerpt ?? ''}
				</p>

				<div class="flex items-center gap-2 text-xs text-muted-foreground">
					<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
					<span>·</span>
					<span>{estimateReadingTime(post.content ?? '')}</span>
				</div>
			</div>
		</div>
	</a>
{/if}
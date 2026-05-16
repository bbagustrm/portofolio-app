<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { formatDateShort, estimateReadingTime } from '$lib/utils';
	import type { BlogPost } from '$lib/types';
	import { hoverLift } from '$lib/actions/hover';

	let { post, variant = 'default' } = $props<{
		post: BlogPost;
		variant?: 'default' | 'featured'
	}>();

	let tagsValue = $derived(
		(post.tags ?? []).map((t: { name: string }) => t.name).join(', ')
	);
</script>

{#if variant === 'featured'}
	<a href="/blog/{post.slug}" class="group block">
		<div use:hoverLift={{ y: -4 }} class="space-y-3 py-2">
			<h3 class="font-medium underline text-lg leading-snug line-clamp-3 group-hover:text-primary transition-colors duration-200">
				{post.title}
			</h3>
			{#if post.excerpt}
				<p class="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
			{/if}
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span>{formatDateShort(post.published_at ?? post.created_at)}</span>
				<span>·</span>
				<span>{estimateReadingTime(post.content ?? '')}</span>
			</div>
			{#if post.tags && post.tags.length > 0}
				<div class="flex flex-wrap gap-1">
					{#each post.tags.slice(0, 3) as tag}
						<Badge variant="secondary" class="text-xs">{tag.name}</Badge>
					{/each}
				</div>
			{/if}
		</div>
	</a>

{:else}
	<a href="/blog/{post.slug}" class="group block">
		<div
			use:hoverLift={{ y: -3, duration: 0.18 }}
			class="flex gap-4 py-4 px-3 -mx-3 rounded-xl border border-transparent
				transition-colors duration-200 hover:border-border hover:bg-muted/20"
		>
			<!-- Thumbnail -->
			<div class="shrink-0 w-24 h-24 md:w-42 md:h-42 rounded-lg overflow-hidden bg-muted">
				{#if post.cover_url}
					<img
						src={post.cover_url}
						alt={post.title}
						class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
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
				{#if post.tags && post.tags.length > 0}
					<div class="flex flex-wrap gap-1 mb-2">
						{#each post.tags.slice(0, 2) as tag}
							<Badge variant="secondary" class="text-xs">{tag.name}</Badge>
						{/each}
					</div>
				{/if}

				<h3 class="font-medium md:text-xl leading-snug mb-1
					group-hover:text-primary transition-colors duration-200 line-clamp-2">
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
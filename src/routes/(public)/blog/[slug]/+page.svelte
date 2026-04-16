<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft } from 'phosphor-svelte';
	import { formatDate, estimateReadingTime } from '$lib/utils';

	let { data } = $props();
	let post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} — Blog</title>
	<meta name="description" content={post.excerpt ?? ''} />
</svelte:head>

<article class="container mx-auto max-w-3xl px-4 py-16">
	<a href="/blog" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
		<ArrowLeft size={16} />
		Back to Blog
	</a>

	{#if post.cover_url}
		<div class="aspect-video rounded-xl overflow-hidden mb-8">
			<img src={post.cover_url} alt={post.title} class="w-full h-full object-cover" />
		</div>
	{/if}

	<header class="mb-10">
		{#if post.tags && post.tags.length > 0}
			<div class="flex flex-wrap gap-1.5 mb-4">
				{#each post.tags as tag}
					<Badge variant="secondary">{tag.name}</Badge>
				{/each}
			</div>
		{/if}

		<h1 class="text-3xl font-bold mb-4 leading-tight sm:text-4xl">
			{post.title}
		</h1>

		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span>{formatDate(post.published_at ?? post.created_at)}</span>
			<span>·</span>
			<span>{estimateReadingTime(post.content ?? '')}</span>
		</div>
	</header>

	<div class="prose prose-neutral dark:prose-invert max-w-none
		prose-headings:font-bold prose-headings:tracking-tight
		prose-a:text-primary prose-a:no-underline hover:prose-a:underline
		prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
		prose-pre:bg-muted prose-img:rounded-lg">
		{@html post.content ?? ''}
	</div>
</article>
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft } from '@lucide/svelte';
	import { formatDate, estimateReadingTime } from '$lib/utils';
	import { reveal } from '$lib/actions/reveal';

	let { data } = $props();
	let post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} — Blog</title>
	<meta name="description" content={post.excerpt ?? ''} />
</svelte:head>

<article class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back -->
	<div use:reveal={{ x: -16, y: 0, duration: 0.4 }}>
		<a href="/blog"
		   class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
		>
			<ArrowLeft class="size-4" />
			Back to Blog
		</a>
	</div>

	<!-- Cover -->
	{#if post.cover_url}
		<div use:reveal={{ y: 24, delay: 100, duration: 0.6 }} class="aspect-21/6 rounded-2xl overflow-hidden mb-10 border">
			<img src={post.cover_url} alt={post.title} class="w-full h-full object-cover" />
		</div>
	{/if}

	<!-- Header -->
	<header use:reveal={{ y: 20, delay: 150 }} class="mb-10">
		<!-- Tags -->
		{#if post.tags && post.tags.length > 0}
			<div class="flex flex-wrap gap-1.5 mb-5">
				{#each post.tags as tag}
					<a href="/blog?tag={tag.slug}">
						<Badge variant="secondary" class="hover:bg-primary/10 transition-colors cursor-pointer">
							{tag.name}
						</Badge>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Title — h1 auto serif -->
		<h1 class="text-4xl font-semibold mb-5 leading-tight sm:text-5xl">
			{post.title}
		</h1>

		<!-- Meta row -->
		<div class="flex items-center gap-3 text-sm text-muted-foreground pb-8 border-b">
			<span>{formatDate(post.published_at ?? post.created_at)}</span>
			<span class="size-1 rounded-full bg-muted-foreground/40"></span>
			<span>{estimateReadingTime(post.content ?? '')}</span>
		</div>
	</header>

	<!-- Content -->
	<div use:reveal={{ y: 16, delay: 250 }} class="prose-custom">
		{@html post.content ?? ''}
	</div>

	<!-- Footer -->
	<footer class="mt-16 pt-8 border-t">

		<a href="/blog"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
		<ArrowLeft class="size-4" />
		Back to Blog
		</a>
	</footer>
</article>
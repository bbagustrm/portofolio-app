<script lang="ts">
	import PostCard from '$lib/components/blog/PostCard.svelte';

	let { data } = $props();

	let selectedTag = $state<string | null>(null);

	const filtered = $derived(
		selectedTag
			? data.posts.filter((p) => p.tags?.some((t) => t.slug === selectedTag))
			: data.posts
	);
</script>

<svelte:head>
	<title>Blog — Bagus</title>
	<meta name="description" content="Articles about web development, programming, and tech." />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-16">
	<div class="mb-12">
		<p class="text-sm text-primary font-medium mb-2">WRITING</p>
		<h1 class="text-4xl font-bold mb-4">Blog</h1>
		<p class="text-muted-foreground max-w-xl">
			Thoughts and articles on web development, engineering, and things I find interesting.
		</p>
	</div>

	<!-- Tag filter -->
	{#if data.tags.length > 0}
		<div class="flex flex-wrap gap-2 mb-10">
			<button
				onclick={() => (selectedTag = null)}
				class="text-xs px-3 py-1.5 rounded-full border transition-colors
					{selectedTag === null
						? 'bg-primary text-primary-foreground border-primary'
						: 'border-border hover:bg-muted'}"
			>
				All
			</button>
			{#each data.tags as tag}
				<button
					onclick={() => (selectedTag = selectedTag === tag.slug ? null : tag.slug)}
					class="text-xs px-3 py-1.5 rounded-full border transition-colors
						{selectedTag === tag.slug
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border hover:bg-muted'}"
				>
					{tag.name}
				</button>
			{/each}
		</div>
	{/if}

	{#if filtered.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20 text-muted-foreground">
			<p class="text-4xl mb-4">📝</p>
			<p>No posts found.</p>
		</div>
	{/if}
</div>
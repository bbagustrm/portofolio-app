<script lang="ts">
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import { Search } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { BlogPost } from '$lib/types';
	import { reveal } from '$lib/actions/reveal';
	import * as m from '$paraglide/messages';
	import { useBlogPosts } from '$lib/queries/blog.svelte';

	let { data } = $props();

	const postsQuery = useBlogPosts();
	
	const posts = $derived(postsQuery.data ?? data.posts);

	let searchQuery = $state('');
	let selectedTag = $state<string | null>(null);

	let isFiltering = $derived(
		searchQuery.trim() !== '' || selectedTag !== null
	);

	// Latest post untuk sidebar kanan
	let latestPost = $derived(posts[0] ?? null);

	// Filter ALL posts — dipakai saat search/filter aktif
	let filteredAll = $derived(
		posts.filter((post: BlogPost) => {
			const matchSearch = searchQuery.trim() === ''
				? true
				: post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(post.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase());

			const matchTag = selectedTag === null
				? true
				: (post.tags ?? []).some((t) => t.slug === selectedTag);

			return matchSearch && matchTag;
		})
	);

	// Posts untuk left column saat normal (exclude latest agar tidak duplikat dengan sidebar)
	let listPosts = $derived(
		posts.length > 1 ? posts.slice(1) : posts
	);

	// Posts yang ditampilkan di left column
	let displayPosts = $derived(isFiltering ? filteredAll : listPosts);
</script>

<svelte:head>
	<title>Blog — Atmojo</title>
	<meta name="description" content={m.meta_blog_description()} />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-16">

	<!-- 2 Column layout -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

		<!-- LEFT — Search + List -->
		<div class="lg:col-span-2">

			<!-- Header -->
			<div use:reveal={{ y: 20 }} class="mb-10">
				<p class="text-sm text-primary font-medium font-sans mb-2 uppercase tracking-wider">{m.blog_title()}</p>
				<h1 class="text-5xl font-semibold mb-4">{m.blog_title()}</h1>
				<p class="text-muted-foreground max-w-xl text-lg">
					{m.blog_subtitle()}
				</p>
			</div>

			<!-- Tag filter -->
			{#if data.tags.length > 0}
				<div use:reveal={{ y: 16, delay: 0.1 }} class="flex flex-wrap gap-2 mb-8">
					<button
						onclick={() => (selectedTag = null)}
						class="text-xs px-3 py-1.5 rounded-full border transition-colors
					{selectedTag === null
						? 'bg-primary text-primary-foreground border-primary'
						: 'border-border hover:bg-muted text-muted-foreground'}"
					>
						{m.portfolio_filter_all()}
					</button>
					{#each data.tags as tag}
						<button
							onclick={() => (selectedTag = selectedTag === tag.slug ? null : tag.slug)}
							class="text-xs px-3 py-1.5 rounded-full border transition-colors
						{selectedTag === tag.slug
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border hover:bg-muted text-muted-foreground'}"
						>
							{tag.name}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Search bar -->
			<div class="relative mb-6">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<input
					type="text"
					placeholder={m.common_search()}
					bind:value={searchQuery}
					class="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border bg-background
						focus:outline-none focus:ring-2 focus:ring-ring transition-colors
						placeholder:text-muted-foreground"
				/>
			</div>

			<!-- Results info — hanya tampil saat filter aktif -->
			{#if isFiltering}
				<p class="text-sm text-muted-foreground mb-4">
					{#if searchQuery.trim() !== ''}
						{m.blog_showing_results()}
						<span class="font-medium text-foreground">"{searchQuery}"</span>
					{/if}
					{#if selectedTag !== null}
						{searchQuery.trim() !== '' ? m.blog_in() : m.blog_filtered_by()}
						<span class="font-medium text-foreground">
							{data.tags.find((t) => t.slug === selectedTag)?.name}
						</span>
					{/if}
					— <span class="font-medium text-foreground">{filteredAll.length}</span>
					{filteredAll.length !== 1 ? m.blog_articles() : m.blog_article()}
				</p>
			{/if}

			<!-- Post list -->
			{#if data.posts.length === 0}
				<div class="text-center py-20 text-muted-foreground">
					<p class="text-4xl mb-4">📝</p>
					<p>{m.blog_empty()}</p>
				</div>

			{:else if isFiltering && filteredAll.length === 0}
				<div class="text-center py-16 text-muted-foreground">
					<p class="text-3xl mb-3">🔍</p>
					<p class="font-medium mb-1">{m.blog_no_results()}</p>
					<p class="text-sm">{m.blog_no_results_subtitle()}</p>
				</div>

			{:else if !isFiltering && listPosts.length === 0}
				<!-- Hanya 1 post dan sudah tampil di sidebar kanan -->
				<div class="text-center py-16 text-muted-foreground border rounded-xl">
					<p class="text-3xl mb-3">📰</p>
					<p class="text-sm">{m.blog_single_post_message()}</p>
					<p class="text-sm mt-1">{m.blog_coming_soon()}</p>
				</div>

			{:else}
				<div>
					{#each displayPosts as post (post.id)}
						<PostCard {post} />
					{/each}
				</div>
			{/if}
		</div>

		<!-- RIGHT — Latest Post + Topics + Stats -->
		<div use:reveal={{ y: 24, delay: 0.15 }}  class="lg:col-span-1 space-y-6 hidden lg:block">

			<!-- Latest post — sembunyikan saat filter aktif -->
			{#if latestPost && !isFiltering}
				<div>
					<h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 font-sans">
						{m.blog_new_post()}
					</h2>
					<PostCard post={latestPost} variant="featured" />
				</div>
			{/if}

			<!-- Topics -->
			{#if data.tags.length > 0}
				<div>
					<h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 font-sans">
						{m.blog_topics()}
					</h2>
					<div class="flex flex-wrap gap-2">
						{#each data.tags as tag}
							<button onclick={() => (selectedTag = selectedTag === tag.slug ? null : tag.slug)}>
								<Badge
									variant={selectedTag === tag.slug ? 'default' : 'outline'}
									class="cursor-pointer hover:bg-primary/10 transition-colors"
								>
									{tag.name}
								</Badge>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Article count -->
			<div class="rounded-xl border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground mb-1">{m.blog_total_articles()}</p>
				<p class="text-3xl font-semibold text-primary">{data.posts.length}</p>
			</div>
		</div>
	</div>
</div>
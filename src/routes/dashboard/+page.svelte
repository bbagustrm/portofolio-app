<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Kanban, Article, Images, Plus, ArrowRight } from 'phosphor-svelte';
	import { formatDateShort } from '$lib/utils';

	let { data } = $props();
	let { stats, recentProjects, recentBlogPosts } = $derived(data);
</script>

<svelte:head>
	<title>Dashboard — Overview</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold">Overview</h1>
		<p class="text-muted-foreground mt-1">Welcome back! Here's what's going on.</p>
	</div>

	<!-- Stats -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Projects</CardTitle>
				<Kanban size={16} class="text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{stats.totalProjects}</p>
				<p class="text-xs text-muted-foreground mt-1">
					{stats.publishedProjects} published
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Blog Posts</CardTitle>
				<Article size={16} class="text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{stats.totalBlogPosts}</p>
				<p class="text-xs text-muted-foreground mt-1">
					{stats.publishedBlogPosts} published
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Gallery Posts</CardTitle>
				<Images size={16} class="text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold">{stats.totalGalleryPosts}</p>
				<p class="text-xs text-muted-foreground mt-1">photos & videos</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick actions -->
	<div>
		<h2 class="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
		<div class="flex flex-wrap gap-3">
			<a href="/dashboard/projects/new">
				<Button class="gap-2">
					<Plus size={16} />
					New Project
				</Button>
			</a>
			<a href="/dashboard/blog/new">
				<Button variant="outline" class="gap-2">
					<Plus size={16} />
					New Post
				</Button>
			</a>
			<a href="/dashboard/gallery/new">
				<Button variant="outline" class="gap-2">
					<Plus size={16} />
					Upload Photo
				</Button>
			</a>
		</div>
	</div>

	<!-- Recent Projects -->
	{#if recentProjects.length > 0}
		<div>
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-sm font-medium text-muted-foreground">Recent Projects</h2>
				<a href="/dashboard/projects" class="text-xs text-primary hover:underline flex items-center gap-1">
					View all <ArrowRight size={12} />
				</a>
			</div>
			<div class="space-y-2">
				{#each recentProjects as project}
					<Card>
						<CardContent class="flex items-center justify-between py-3 px-4">
							<div>
								<p class="text-sm font-medium">{project.title}</p>
								<p class="text-xs text-muted-foreground">{formatDateShort(project.created_at)}</p>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant={project.is_published ? 'default' : 'secondary'} class="text-xs">
									{project.is_published ? 'Published' : 'Draft'}
								</Badge>
								<a href="/dashboard/projects/{project.id}/edit">
									<Button variant="ghost" size="sm">Edit</Button>
								</a>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent Blog Posts -->
	{#if recentBlogPosts.length > 0}
		<div>
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-sm font-medium text-muted-foreground">Recent Blog Posts</h2>
				<a href="/dashboard/blog" class="text-xs text-primary hover:underline flex items-center gap-1">
					View all <ArrowRight size={12} />
				</a>
			</div>
			<div class="space-y-2">
				{#each recentBlogPosts as post}
					<Card>
						<CardContent class="flex items-center justify-between py-3 px-4">
							<div>
								<p class="text-sm font-medium">{post.title}</p>
								<p class="text-xs text-muted-foreground">{formatDateShort(post.created_at)}</p>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant={post.is_published ? 'default' : 'secondary'} class="text-xs">
									{post.is_published ? 'Published' : 'Draft'}
								</Badge>
								<a href="/dashboard/blog/{post.id}/edit">
									<Button variant="ghost" size="sm">Edit</Button>
								</a>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	{/if}
</div>
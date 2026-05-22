<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		FolderKanban, BookText, Images,
		Plus, ArrowRight, Eye, TrendingUp,
		BarChart2, ExternalLink
	} from '@lucide/svelte';
	import { formatDateShort } from '$lib/utils';
	import { counter } from '$lib/actions/counter';
	import { animateBars, animateProgress } from '$lib/actions/chart';
	import { reveal, revealStagger } from '$lib/actions/reveal';

	let { data } = $props();
	let { stats, recentProjects, recentBlogPosts, analytics } = $derived(data);

	let chartData = $derived(analytics.dailyViews.slice(-14));
	let maxViews = $derived(Math.max(...chartData.map((d) => d.views), 1));

	function formatPath(path: string): string {
		if (path === '/') return 'Home';
		return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\//g, ' › ');
	}

	function formatShortDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head><title>Dashboard — Overview</title></svelte:head>

<div class="space-y-8">

	<!-- Header -->
	<div use:reveal={{ y: 16 }} class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Overview</h1>
			<p class="text-muted-foreground mt-1 text-sm">Welcome back! Here's what's going on.</p>
		</div>
		<a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
			<Button variant="outline" size="sm" class="gap-2">
				<ExternalLink class="size-3.5" />
				Vercel Analytics
			</Button>
		</a>
	</div>

	<!-- Analytics stat cards — counter animation -->
	<div use:revealStagger={{ stagger: 0.08, y: 20 }} class="grid gap-4 grid-cols-2 lg:grid-cols-4">

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
				<Eye class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: analytics.totalViews, duration: 1.5 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">all time</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Today</CardTitle>
				<TrendingUp class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: analytics.todayViews, duration: 1, delay: 0.08 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">page views</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">This Week</CardTitle>
				<BarChart2 class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: analytics.weekViews, duration: 1.2, delay: 0.16 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">last 7 days</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">This Month</CardTitle>
				<BarChart2 class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: analytics.monthViews, duration: 1.4, delay: 0.24 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">last 30 days</p>
			</CardContent>
		</Card>
	</div>

	<!-- Chart + Top pages -->
	<div use:reveal={{ y: 24, delay: 0.1 }} class="grid gap-6 lg:grid-cols-3">

		<!-- Bar chart -->
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle class="text-base">Traffic — Last 14 Days</CardTitle>
			</CardHeader>
			<CardContent>
				{#if chartData.every((d) => d.views === 0)}
					<div class="h-40 flex items-center justify-center text-muted-foreground text-sm">
						No data yet. Visit your site to start tracking.
					</div>
				{:else}
					<!-- Bar chart dengan animasi -->
					<div
						use:animateBars={{ delay: 0.2, duration: 0.7, stagger: 0.04 }}
						class="flex items-end gap-1 h-40"
					>
						{#each chartData as day}
							<div class="flex-1 flex flex-col items-center gap-1 group">
								<div
									data-bar
									class="w-full bg-primary/20 hover:bg-primary/60 rounded-sm
										transition-colors duration-200 cursor-default relative"
									style="height: {Math.max((day.views / maxViews) * 100, 2)}%"
									title="{day.views} views"
								>
									<!-- Tooltip -->
									<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border
										text-xs px-2 py-1 rounded whitespace-nowrap
										opacity-0 group-hover:opacity-100 transition-opacity
										pointer-events-none z-10 shadow-sm">
										{day.views}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- X axis -->
					<div class="flex gap-1 mt-2">
						{#each chartData as day, i}
							<div class="flex-1 text-center">
								{#if i % 2 === 0}
									<span class="text-xs text-muted-foreground">
										{formatShortDate(day.date)}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Top pages -->
		<Card>
			<CardHeader>
				<CardTitle class="text-base">Top Pages</CardTitle>
			</CardHeader>
			<CardContent>
				{#if analytics.topPages.length === 0}
					<p class="text-sm text-muted-foreground text-center py-8">No data yet.</p>
				{:else}
					<div class="space-y-3">
						{#each analytics.topPages as page, i}
							{@const pct = Math.round((page.views / (analytics.monthViews || 1)) * 100)}
							<div class="space-y-1.5">
								<div class="flex items-center justify-between text-sm">
									<span class="capitalize font-medium truncate max-w-[140px]">
										{formatPath(page.path)}
									</span>
									<span class="text-muted-foreground shrink-0 ml-2 tabular-nums">
										<span use:counter={{
											target: page.views,
											duration: 1,
											delay: i * 0.08
										}}></span>
									</span>
								</div>
								<div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
									<div
										use:animateProgress={{ delay: 0.3 + i * 0.06, duration: 0.6 }}
										class="h-full bg-primary rounded-full"
										style="width: {pct}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Content stats — counter juga -->
	<div use:revealStagger={{ stagger: 0.08, y: 20 }} class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Projects</CardTitle>
				<FolderKanban class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: stats.totalProjects, duration: 0.8 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">
					<span use:counter={{ target: stats.publishedProjects, duration: 0.6 }}></span> published
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Blog Posts</CardTitle>
				<BookText class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: stats.totalBlogPosts, duration: 0.8 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">
					<span use:counter={{ target: stats.publishedBlogPosts, duration: 0.6 }}></span> published
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Gallery Posts</CardTitle>
				<Images class="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-bold"
					use:counter={{ target: stats.totalGalleryPosts, duration: 0.8 }}
				></p>
				<p class="text-xs text-muted-foreground mt-1">photos & videos</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick actions -->
	<div use:reveal={{ y: 16 }}>
		<h2 class="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
		<div class="flex flex-wrap gap-3">
			<a href="/dashboard/projects/new">
				<Button class="gap-2"><Plus class="size-4" />New Project</Button>
			</a>
			<a href="/dashboard/blog/new">
				<Button variant="outline" class="gap-2"><Plus class="size-4" />New Post</Button>
			</a>
			<a href="/dashboard/gallery/new">
				<Button variant="outline" class="gap-2"><Plus class="size-4" />Upload Photo</Button>
			</a>
		</div>
	</div>

	<!-- Recent items -->
	<div use:reveal={{ y: 20, delay: 0.1 }} class="grid gap-6 lg:grid-cols-2">
		{#if recentProjects.length > 0}
			<div>
				<div class="flex items-center justify-between mb-3">
					<h2 class="text-sm font-medium text-muted-foreground">Recent Projects</h2>
					<a href="/dashboard/projects" class="text-xs text-primary hover:underline flex items-center gap-1">
						View all <ArrowRight class="size-3" />
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

		{#if recentBlogPosts.length > 0}
			<div>
				<div class="flex items-center justify-between mb-3">
					<h2 class="text-sm font-medium text-muted-foreground">Recent Posts</h2>
					<a href="/dashboard/blog" class="text-xs text-primary hover:underline flex items-center gap-1">
						View all <ArrowRight class="size-3" />
					</a>
				</div>
				<div class="space-y-2">
					{#each recentBlogPosts as post}
						<Card>
							<CardContent class="flex items-center justify-between py-3 px-4">
								<div>
									<p class="text-sm font-medium line-clamp-1">{post.title}</p>
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
</div>
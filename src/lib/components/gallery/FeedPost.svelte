<script lang="ts">
	import { timeAgo } from '$lib/utils';
	import type { Post, Media } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { X, ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { post } = $props<{ post: Post }>();

	let media = $derived(post.media ?? []);

	function getGridClass(count: number): string {
		if (count === 1) return 'grid-cols-1';
		if (count === 2) return 'grid-cols-2';
		if (count === 3) return 'grid-cols-3';
		return 'grid-cols-2';
	}

	function getItemClass(count: number, index: number): string {
		if (count === 3 && index === 0) return 'col-span-3';
		return '';
	}

	let modalOpen = $state(false);
	let activeIndex = $state(0);
	let activeMedia = $derived(media[activeIndex]);

	// Deteksi apakah md ke atas
	let isDesktop = $state(false);

	$effect(() => {
		const mql = window.matchMedia('(min-width: 768px)');
		isDesktop = mql.matches;

		const handler = (e: MediaQueryListEvent) => {
			isDesktop = e.matches;
		};

		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	function openModal(index: number) {
		activeIndex = index;
		modalOpen = true;
	}

	function prev() {
		activeIndex = (activeIndex - 1 + media.length) % media.length;
	}

	function next() {
		activeIndex = (activeIndex + 1) % media.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!modalOpen) return;
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<article class="border rounded-2xl overflow-hidden bg-card">
	<!-- Post header -->
	<div class="flex items-center gap-3 px-4 pt-4 pb-3">
		<div class="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
			<span class="text-sm font-semibold text-primary">A</span>
		</div>
		<div>
			<p class="text-sm font-semibold leading-none">Atmojo</p>
			<p class="text-xs text-muted-foreground mt-0.5">{timeAgo(post.created_at)}</p>
		</div>
	</div>

	<!-- Caption -->
	{#if post.caption}
		<div class="px-4 pb-3">
			<p class="text-sm leading-relaxed">{post.caption}</p>
		</div>
	{/if}

	<!-- Media -->
	{#if media.length === 1}
		<button class="w-full block cursor-pointer" onclick={() => openModal(0)} aria-label="View photo">
			<div class="w-full aspect-square overflow-hidden">
				{#if media[0].type === 'image'}
					<img
						src={media[0].url}
						alt={post.caption ?? ''}
						class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
						loading="lazy"
					/>
				{:else}
					<video src={media[0].url} class="w-full h-full object-cover" muted playsinline preload="metadata">
						<track kind="captions" />
					</video>
				{/if}
			</div>
		</button>

	{:else if media.length > 1}
		<div class="grid {getGridClass(media.length)} gap-0.5">
			{#each media.slice(0, 4) as item, i}
				<button
					class="relative overflow-hidden bg-muted cursor-pointer
						{getItemClass(media.length, i)}
						{media.length === 3 && i === 0 ? 'aspect-video' : 'aspect-square'}"
					onclick={() => openModal(i)}
					aria-label="View photo {i + 1}"
				>
					{#if item.type === 'image'}
						<img
							src={item.url}
							alt={post.caption ?? ''}
							class="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
							loading="lazy"
						/>
					{:else}
						<video src={item.url} class="w-full h-full object-cover" muted playsinline preload="metadata">
							<track kind="captions" />
						</video>
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="size-12 rounded-full bg-black/50 flex items-center justify-center">
								<span class="text-white text-lg">▶</span>
							</div>
						</div>
					{/if}
					{#if i === 3 && media.length > 4}
						<div class="absolute inset-0 bg-black/60 flex items-center justify-center">
							<span class="text-white text-2xl font-bold">+{media.length - 4}</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Post footer -->
	<div class="px-4 py-3 flex items-center justify-between">
		<div class="flex items-center gap-3 text-xs text-muted-foreground">
			{#if media.length > 0}
				<span>{media.length} {media.length === 1 ? 'photo' : 'photos/videos'}</span>
			{/if}
			{#if post.mood}
				<span>· feeling {post.mood}</span>
			{/if}
		</div>
		<span class="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
	</div>
</article>

<!-- ─── Shared media content snippet ─────────────────── -->
{#snippet mediaViewer()}
	{#if activeMedia?.type === 'image'}
		<img src={activeMedia.url} alt={post.caption ?? ''} class="w-full h-full object-cover" />
	{:else if activeMedia?.type === 'video'}
		<video src={activeMedia.url} class="w-full h-full object-cover" controls playsinline autoplay>
			<track kind="captions" />
		</video>
	{/if}
	{#if media.length > 1}
		<button
			onclick={prev}
			class="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
			aria-label="Previous"
		>
			<ChevronLeft class="size-5" />
		</button>
		<button
			onclick={next}
			class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
			aria-label="Next"
		>
			<ChevronRight class="size-5" />
		</button>
	{/if}
{/snippet}

{#snippet photoList()}
	<!-- Header — tidak scroll -->
	<div class="flex items-center gap-3 p-4 border-b shrink-0">
		<div class="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
			<span class="text-xs font-semibold text-primary">A</span>
		</div>
		<div class="min-w-0">
			<p class="text-sm font-semibold">Atmojo</p>
			<p class="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
		</div>
	</div>

	<!-- Caption + Photo list — scrollable bersama -->
	<div class="flex-1 overflow-y-auto">
		{#if post.caption}
			<div class="px-4 py-3 border-b">
				<p class="text-sm leading-relaxed">{post.caption}</p>
			</div>
		{/if}

		<div class="p-3">
			<p class="text-xs text-muted-foreground font-medium mb-2 px-1">
				{media.length} {media.length === 1 ? 'file' : 'files'}
			</p>
			<div class="grid grid-cols-3 gap-1.5">
				{#each media as item, i}
					<button
						onclick={() => (activeIndex = i)}
						class="relative aspect-square rounded-lg overflow-hidden bg-muted ring-2 transition-all duration-150
							{activeIndex === i ? 'ring-primary' : 'ring-transparent hover:ring-primary/40'}"
						aria-label="View file {i + 1}"
					>
						{#if item.type === 'image'}
							<img src={item.url} alt="" class="w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full bg-muted flex items-center justify-center">
								<span class="text-lg">▶</span>
							</div>
						{/if}
						{#if activeIndex === i}
							<div class="absolute inset-0 bg-primary/10"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Counter — tidak scroll -->
	{#if media.length > 1}
		<div class="px-4 py-3 border-t shrink-0 text-center">
			<span class="text-xs text-muted-foreground">{activeIndex + 1} / {media.length}</span>
		</div>
	{/if}
{/snippet}

<!-- ─── DESKTOP: Dialog (md+) ────────────────────────── -->
{#if isDesktop}
	<Dialog.Root bind:open={modalOpen}>
		<Dialog.Content
			class="p-0 gap-0 overflow-hidden rounded-2xl border-0 h-[90vh]"
			showCloseButton={false}
		>
			<div class="flex h-full">
				<!-- Left — media -->
				<div class="relative flex-1 bg-black min-h-0 min-w-0 overflow-hidden">
					<button
						onclick={() => (modalOpen = false)}
						class="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
						aria-label="Close"
					>
						<X class="size-4" />
					</button>
					{@render mediaViewer()}
				</div>

				<!-- Right — info + list -->
				<div class="w-64 shrink-0 flex flex-col border-l bg-card">
					{@render photoList()}
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- ─── MOBILE: Drawer (sm) ──────────────────────────── -->
{:else}
	<Drawer.Root bind:open={modalOpen}>
		<Drawer.Content class="p-0 max-h-[92vh]">
			<Drawer.Header class="p-0">
				<!-- Media preview atas -->
				<div class="relative w-full aspect-square bg-black overflow-hidden">
					{@render mediaViewer()}
				</div>
			</Drawer.Header>

			<!-- Info + list bawah, scrollable -->
			<div class="flex flex-col overflow-y-auto max-h-[40vh]">
				{@render photoList()}
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
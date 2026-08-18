import { createInfiniteQuery } from '@tanstack/svelte-query';
import { getLocale } from '$paraglide/runtime';

type GalleryPage = {
	posts: any[];
	nextCursor: string | null;
};

export function useInfiniteGallery(limit = 8) {
	return createInfiniteQuery(() => ({
		queryKey: ['gallery', 'infinite', limit, getLocale()],
		queryFn: async ({ pageParam }: { pageParam: string | null }) => {
			const url = new URL('/api/gallery', window.location.origin);
			if (pageParam) url.searchParams.set('cursor', pageParam);
			url.searchParams.set('limit', String(limit));
			url.searchParams.set('locale', getLocale());
			
			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to fetch gallery');
			
			return res.json() as Promise<GalleryPage>;
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage: GalleryPage) => lastPage.nextCursor ?? undefined
	}));
}

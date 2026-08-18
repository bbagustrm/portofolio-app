import { createQuery } from '@tanstack/svelte-query';
import type { AnalyticsSummary } from '$lib/server/db/analytics';

export function useAnalyticsSummary(days = 30) {
	return createQuery(() => ({
		queryKey: ['analytics', 'summary', days],
		queryFn: async () => {
			const response = await fetch(`/api/analytics?days=${days}`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch analytics');
			}
			
			return response.json() as Promise<AnalyticsSummary>;
		},
		staleTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000
	}));
}

export function useDailyViews(days = 14) {
	return createQuery(() => ({
		queryKey: ['analytics', 'daily-views', days],
		queryFn: async () => {
			const response = await fetch(`/api/analytics?days=${days}`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch daily views');
			}
			
			const data = await response.json() as AnalyticsSummary;
			return data.dailyViews;
		},
		staleTime: 5 * 60 * 1000
	}));
}

export function useTopPages() {
	return createQuery(() => ({
		queryKey: ['analytics', 'top-pages'],
		queryFn: async () => {
			const response = await fetch('/api/analytics?days=30');
			
			if (!response.ok) {
				throw new Error('Failed to fetch top pages');
			}
			
			const data = await response.json() as AnalyticsSummary;
			return data.topPages;
		},
		staleTime: 5 * 60 * 1000
	}));
}

import type { SupabaseClient } from '@supabase/supabase-js';

export type DailyViews = { date: string; views: number };
export type TopPage = { path: string; views: number };

export type AnalyticsSummary = {
	totalViews: number;
	todayViews: number;
	weekViews: number;
	monthViews: number;
	dailyViews: DailyViews[];
	topPages: TopPage[];
};

export async function getAnalyticsSummary(
	supabase: SupabaseClient,
	days = 30
): Promise<AnalyticsSummary> {
	const now = new Date();

	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);

	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - 7);

	const startOfRange = new Date(now);
	startOfRange.setDate(now.getDate() - days);

	const { data: rawViews } = await supabase
		.from('page_views')
		.select('path, created_at')
		.gte('created_at', startOfRange.toISOString())
		.order('created_at', { ascending: true });

	const views = rawViews ?? [];

	const { count: totalViews } = await supabase
		.from('page_views')
		.select('*', { count: 'exact', head: true });

	const todayViews = views.filter((v) => new Date(v.created_at) >= startOfToday).length;
	const weekViews = views.filter((v) => new Date(v.created_at) >= startOfWeek).length;
	const monthViews = views.length;

	// Daily views — pre-fill semua tanggal
	const dailyMap = new Map<string, number>();
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(now.getDate() - i);
		dailyMap.set(d.toISOString().split('T')[0], 0);
	}
	views.forEach((v) => {
		const key = new Date(v.created_at).toISOString().split('T')[0];
		dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
	});

	const dailyViews: DailyViews[] = Array.from(dailyMap.entries())
		.map(([date, count]) => ({ date, views: count }));

	// Top pages
	const pathMap = new Map<string, number>();
	views.forEach((v) => pathMap.set(v.path, (pathMap.get(v.path) ?? 0) + 1));

	const topPages: TopPage[] = Array.from(pathMap.entries())
		.map(([path, count]) => ({ path, views: count }))
		.sort((a, b) => b.views - a.views)
		.slice(0, 8);

	return { totalViews: totalViews ?? 0, todayViews, weekViews, monthViews, dailyViews, topPages };
}
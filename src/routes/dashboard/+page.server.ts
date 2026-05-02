import type { PageServerLoad } from './$types';
import { getAllProjects } from '$lib/server/db/projects';
import { getAllPosts as getAllBlogPosts } from '$lib/server/db/blog';
import { getAllPostsForDashboard } from '$lib/server/db/gallery';
import { getAnalyticsSummary } from '$lib/server/db/analytics';

export const load: PageServerLoad = async ({ locals }) => {
	const [projects, blogPosts, galleryPosts, analytics] = await Promise.all([
		getAllProjects(locals.supabase),
		getAllBlogPosts(locals.supabase),
		getAllPostsForDashboard(locals.supabase),
		getAnalyticsSummary(locals.supabase, 30)
	]);

	return {
		stats: {
			totalProjects: projects.length,
			publishedProjects: projects.filter((p) => p.is_published).length,
			totalBlogPosts: blogPosts.length,
			publishedBlogPosts: blogPosts.filter((p) => p.is_published).length,
			totalGalleryPosts: galleryPosts.length
		},
		recentProjects: projects.slice(0, 3),
		recentBlogPosts: blogPosts.slice(0, 3),
		analytics
	};
};
import type { PageServerLoad } from './$types';
import { getFeaturedProjects } from '$lib/server/db/projects';
import { getPublishedPosts as getBlogPosts } from '$lib/server/db/blog';
import { getPublishedPosts as getGalleryPosts } from '$lib/server/db/gallery';
import { getProfile } from '$lib/server/db/profile';
import { OWNER_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	const [featuredProjects, latestPosts, galleryResult, profile] = await Promise.all([
		getFeaturedProjects(locals.supabase),
		getBlogPosts(locals.supabase),
		getGalleryPosts(locals.supabase, undefined, 6),
		getProfile(locals.supabase, OWNER_ID)
	]);

	return {
		featuredProjects,
		latestPosts: latestPosts.slice(0, 8),
		galleryPosts: galleryResult.posts,
		profile
	};
};
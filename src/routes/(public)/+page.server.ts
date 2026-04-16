import type { PageServerLoad } from './$types';
import { getFeaturedProjects } from '$lib/server/db/projects';
import { getPublishedPosts } from '$lib/server/db/blog';
import { getProfile } from '$lib/server/db/profile';
import { OWNER_ID } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	const [featuredProjects, latestPosts, profile] = await Promise.all([
		getFeaturedProjects(locals.supabase),
		getPublishedPosts(locals.supabase),
		getProfile(locals.supabase, OWNER_ID)
	]);

	return {
		featuredProjects,
		latestPosts: latestPosts.slice(0, 3),
		profile
	};
};
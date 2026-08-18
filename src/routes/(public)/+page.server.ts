import type { PageServerLoad } from './$types';
import { getFeaturedProjects } from '$lib/server/db/projects';
import { getPublishedPosts as getBlogPosts } from '$lib/server/db/blog';
import { getPublishedPosts as getGalleryPosts } from '$lib/server/db/gallery';
import { getProfile } from '$lib/server/db/profile';
import { OWNER_ID } from '$env/static/private';
import { getLocaleFromCookies } from '$lib/i18n/server';
import { unwrapOr } from '$lib/utils/result';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	
	const [featuredProjectsResult, latestPosts, galleryResult, profile] = await Promise.all([
		getFeaturedProjects(locals.supabase, locale),
		getBlogPosts(locals.supabase, locale),
		getGalleryPosts(locals.supabase, locale, undefined, 6),
		getProfile(locals.supabase, OWNER_ID)
	]);

	return {
		featuredProjects: unwrapOr(featuredProjectsResult, []),
		latestPosts: latestPosts.slice(0, 8),
		galleryPosts: galleryResult.posts,
		profile
	};
};
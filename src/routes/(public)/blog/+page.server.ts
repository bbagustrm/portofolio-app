import type { PageServerLoad } from './$types';
import { getPublishedPosts, getAllTags } from '$lib/server/db/blog';
import { getLocaleFromCookies } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	
	const [posts, tags] = await Promise.all([
		getPublishedPosts(locals.supabase, locale),
		getAllTags(locals.supabase)
	]);

	return { posts, tags };
};
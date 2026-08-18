import type { PageServerLoad } from './$types';
import { getPublishedPosts } from '$lib/server/db/gallery';
import { getLocaleFromCookies } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	const { posts, nextCursor } = await getPublishedPosts(locals.supabase, locale, undefined, 8);
	return { posts, nextCursor };
};
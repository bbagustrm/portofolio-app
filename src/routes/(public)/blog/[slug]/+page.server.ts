import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPostBySlug } from '$lib/server/db/blog';
import { getLocaleFromCookies } from '$lib/i18n/server';

export const load: PageServerLoad = async ({ params, locals, cookies }) => {
	const locale = getLocaleFromCookies(cookies);
	const post = await getPostBySlug(locals.supabase, params.slug, locale);

	if (!post || !post.is_published) {
		error(404, 'Post not found');
	}

	return { post };
};
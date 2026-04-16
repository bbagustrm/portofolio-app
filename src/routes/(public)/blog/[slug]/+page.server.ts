import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPostBySlug } from '$lib/server/db/blog';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post = await getPostBySlug(locals.supabase, params.slug);

	if (!post || !post.is_published) {
		error(404, 'Post not found');
	}

	return { post };
};
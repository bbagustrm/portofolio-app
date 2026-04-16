import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPostById } from '$lib/server/db/gallery';

export const load: PageServerLoad = async ({ params, locals }) => {
	const post = await getPostById(locals.supabase, params.id);

	if (!post || !post.is_published || post.is_archived) {
		error(404, 'Post not found');
	}

	return { post };
};
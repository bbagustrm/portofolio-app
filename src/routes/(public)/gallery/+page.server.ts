import type { PageServerLoad } from './$types';
import { getPublishedPosts } from '$lib/server/db/gallery';

export const load: PageServerLoad = async ({ locals }) => {
	const { posts, nextCursor } = await getPublishedPosts(locals.supabase, undefined, 12);
	return { posts, nextCursor };
};
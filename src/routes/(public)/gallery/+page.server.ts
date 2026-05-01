import type { PageServerLoad } from './$types';
import { getPublishedPosts } from '$lib/server/db/gallery';

export const load: PageServerLoad = async ({ locals }) => {
	// Load 8 posts awal untuk SSR
	const { posts, nextCursor } = await getPublishedPosts(locals.supabase, undefined, 8);
	return { posts, nextCursor };
};
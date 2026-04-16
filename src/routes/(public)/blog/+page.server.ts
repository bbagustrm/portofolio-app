import type { PageServerLoad } from './$types';
import { getPublishedPosts, getAllTags } from '$lib/server/db/blog';

export const load: PageServerLoad = async ({ locals }) => {
	const [posts, tags] = await Promise.all([
		getPublishedPosts(locals.supabase),
		getAllTags(locals.supabase)
	]);

	return { posts, tags };
};
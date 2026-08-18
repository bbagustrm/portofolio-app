import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPublishedPosts } from '$lib/server/db/gallery';

export const GET: RequestHandler = async ({ url, locals }) => {
	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? 8);
	const locale = url.searchParams.get('locale') ?? 'en';

	try {
		const result = await getPublishedPosts(locals.supabase, locale, cursor, limit);
		return json(result);
	} catch {
		return json({ posts: [], nextCursor: null }, { status: 500 });
	}
};
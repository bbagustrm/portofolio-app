import type { SupabaseClient } from '@supabase/supabase-js';
import type { Post, PostInput, Media } from '$lib/types';

const POST_SELECT = `
	*,
	media (
		id, storage_path, url, type, size, order_index, created_at
	)
`;

export async function getPublishedPosts(
	supabase: SupabaseClient,
	locale = 'en',
	cursor?: string,
	limit = 12
): Promise<{ posts: Post[]; nextCursor: string | null }> {
	let query = supabase
		.from('posts')
		.select(POST_SELECT)
		.eq('is_published', true)
		.eq('is_archived', false)
		.eq('locale', locale)
		.order('created_at', { ascending: false })
		.limit(limit + 1);

	if (cursor) {
		const { data: cursorPost } = await supabase
			.from('posts')
			.select('created_at')
			.eq('id', cursor)
			.single();

		if (cursorPost) {
			query = query.lt('created_at', cursorPost.created_at);
		}
	}

	const { data, error } = await query;
	if (error) throw new Error(error.message);

	const posts = (data ?? []).map(normalizePost);
	const hasMore = posts.length > limit;
	if (hasMore) posts.pop();

	return {
		posts,
		nextCursor: hasMore ? posts[posts.length - 1].id : null
	};
}

export async function getAllPostsForDashboard(supabase: SupabaseClient): Promise<Post[]> {
	const { data, error } = await supabase
		.from('posts')
		.select(POST_SELECT)
		.eq('is_archived', false)
		.order('created_at', { ascending: false });

	if (error) throw new Error(error.message);
	return (data ?? []).map(normalizePost);
}

export async function getPostById(supabase: SupabaseClient, id: string): Promise<Post | null> {
	const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).single();

	if (error) return null;
	return normalizePost(data);
}

export async function createPost(supabase: SupabaseClient, input: PostInput): Promise<Post> {
	const { data, error } = await supabase.from('posts').insert(input).select().single();

	if (error) throw new Error(error.message);
	return data;
}

export async function addMedia(
	supabase: SupabaseClient,
	mediaItems: Omit<Media, 'id' | 'created_at'>[]
): Promise<Media[]> {
	const { data, error } = await supabase.from('media').insert(mediaItems).select();

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function updatePost(
	supabase: SupabaseClient,
	id: string,
	input: Partial<PostInput>
): Promise<Post> {
	const { data, error } = await supabase.from('posts').update(input).eq('id', id).select().single();

	if (error) throw new Error(error.message);
	return data;
}

export async function archivePost(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('posts').update({ is_archived: true }).eq('id', id);

	if (error) throw new Error(error.message);
}

export async function deletePost(supabase: SupabaseClient, id: string): Promise<void> {
	// media akan auto-delete via cascade
	const { error } = await supabase.from('posts').delete().eq('id', id);

	if (error) throw new Error(error.message);
}

// ─── Helper ─────────────────────────────────────────────────

function normalizePost(data: any): Post {
	return {
		...data,
		media: (data.media ?? []).sort((a: Media, b: Media) => a.order_index - b.order_index)
	};
}

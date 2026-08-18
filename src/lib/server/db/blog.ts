import type { SupabaseClient } from '@supabase/supabase-js';
import type { BlogPost, BlogPostInput, Tag } from '$lib/types';
import { generateSlug } from '$lib/utils/slug';

export async function getAllPosts(supabase: SupabaseClient): Promise<BlogPost[]> {
	const { data, error } = await supabase
		.from('blog_posts')
		.select(`
			*,
			tags: blog_post_tags(
				tag: tags(*)
			)
		`)
		.order('created_at', { ascending: false });

	if (error) throw new Error(error.message);
	return normalizePosts(data ?? []);
}

export async function getPublishedPosts(supabase: SupabaseClient, locale = 'en'): Promise<BlogPost[]> {
	const { data, error } = await supabase
		.from('blog_posts')
		.select(`
			*,
			tags: blog_post_tags(
				tag: tags(*)
			)
		`)
		.eq('is_published', true)
		.eq('locale', locale)
		.order('published_at', { ascending: false });

	if (error) throw new Error(error.message);
	return normalizePosts(data ?? []);
}

export async function getPostBySlug(
	supabase: SupabaseClient,
	slug: string,
	locale = 'en'
): Promise<BlogPost | null> {
	const { data, error } = await supabase
		.from('blog_posts')
		.select(`
			*,
			tags: blog_post_tags(
				tag: tags(*)
			)
		`)
		.eq('slug', slug)
		.eq('locale', locale)
		.single();

	if (error) return null;
	return normalizePost(data);
}

export async function getPostById(
	supabase: SupabaseClient,
	id: string
): Promise<BlogPost | null> {
	const { data, error } = await supabase
		.from('blog_posts')
		.select(`
			*,
			tags: blog_post_tags(
				tag: tags(*)
			)
		`)
		.eq('id', id)
		.single();

	if (error) return null;
	return normalizePost(data);
}

export async function createPost(
	supabase: SupabaseClient,
	input: BlogPostInput
): Promise<BlogPost> {
	const { data, error } = await supabase
		.from('blog_posts')
		.insert(input)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

export async function updatePost(
	supabase: SupabaseClient,
	id: string,
	input: Partial<BlogPostInput>
): Promise<BlogPost> {
	const { data, error } = await supabase
		.from('blog_posts')
		.update(input)
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
}

export async function deletePost(
	supabase: SupabaseClient,
	id: string
): Promise<void> {
	const { error } = await supabase
		.from('blog_posts')
		.delete()
		.eq('id', id);

	if (error) throw new Error(error.message);
}

export async function getAllTags(supabase: SupabaseClient): Promise<Tag[]> {
	const { data, error } = await supabase
		.from('tags')
		.select('*')
		.order('name', { ascending: true });

	if (error) throw new Error(error.message);
	return data ?? [];
}

export async function upsertPostTags(
	supabase: SupabaseClient,
	postId: string,
	tagNames: string[]
): Promise<void> {
	// 1. Hapus semua tag lama
	const { error: deleteError } = await supabase
		.from('blog_post_tags')
		.delete()
		.eq('post_id', postId);

	if (deleteError) throw new Error(deleteError.message);

	if (tagNames.length === 0) return;

	// 2. Upsert tags (buat kalau belum ada)
	const tagsToUpsert = tagNames.map((name) => ({
		name: name.trim(),
		slug: generateSlug(name)
	}));

	const { data: tags, error: tagError } = await supabase
		.from('tags')
		.upsert(tagsToUpsert, { onConflict: 'slug' })
		.select();

	if (tagError) throw new Error(tagError.message);

	// 3. Insert blog_post_tags
	const relations = (tags ?? []).map((tag) => ({
		post_id: postId,
		tag_id: tag.id
	}));

	const { error: relationError } = await supabase
		.from('blog_post_tags')
		.insert(relations);

	if (relationError) throw new Error(relationError.message);
}

// ─── Helpers ────────────────────────────────────────────────

// Supabase returns nested join — normalize ke flat tags array
function normalizePost(data: any): BlogPost {
	return {
		...data,
		tags: (data.tags ?? []).map((t: any) => t.tag).filter(Boolean)
	};
}

function normalizePosts(data: any[]): BlogPost[] {
	return data.map(normalizePost);
}
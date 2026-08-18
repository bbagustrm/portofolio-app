import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPostById, updatePost, getAllTags, upsertPostTags } from '$lib/server/db/blog';
import { uploadFile } from '$lib/utils/upload';
import { createSupabaseAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [post, tags] = await Promise.all([
		getPostById(locals.supabase, params.id),
		getAllTags(locals.supabase)
	]);
	if (!post) error(404, 'Post not found');
	return { post, tags };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const form = await request.formData();

		const title = (form.get('title') as string)?.trim();
		const content = (form.get('content') as string)?.trim();
		const excerpt = (form.get('excerpt') as string)?.trim();
		const tags_raw = (form.get('tags') as string)?.trim();
		const is_published = form.get('is_published') === 'on';
		const coverFile = form.get('cover') as File | null;

		if (!title) return fail(400, { error: 'Title is required' });

		const updateData: Record<string, any> = {
			title,
			content: content || null,
			excerpt: excerpt || null,
			is_published,
			published_at: is_published ? new Date().toISOString() : null
		};

		if (coverFile && coverFile.size > 0) {
			try {
				const result = await uploadFile(locals.supabase, coverFile, 'blog', 'covers');
				updateData.cover_url = result.url;
			} catch (e: any) {
				return fail(400, { error: `Upload failed: ${e.message}` });
			}
		}

		try {
			const admin = createSupabaseAdminClient();
			
			await updatePost(locals.supabase, params.id, updateData);
			const tagNames = tags_raw
				? tags_raw.split(',').map((t) => t.trim()).filter(Boolean)
				: [];
			await upsertPostTags(locals.supabase, admin, params.id, tagNames);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/blog');
	}
};
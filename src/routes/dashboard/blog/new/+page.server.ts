import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPost, getAllTags, upsertPostTags } from '$lib/server/db/blog';
import { uploadFile } from '$lib/utils/upload';
import { generateSlug, ensureUniqueSlug } from '$lib/utils/slug';

export const load: PageServerLoad = async ({ locals }) => {
	const tags = await getAllTags(locals.supabase);
	return { tags };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();

		const title = (form.get('title') as string)?.trim();
		const content = (form.get('content') as string)?.trim();
		const excerpt = (form.get('excerpt') as string)?.trim();
		const tags_raw = (form.get('tags') as string)?.trim();
		const is_published = form.get('is_published') === 'on';
		const coverFile = form.get('cover') as File | null;

		if (!title) return fail(400, { error: 'Title is required' });

		let cover_url: string | null = null;
		if (coverFile && coverFile.size > 0) {
			try {
				const result = await uploadFile(locals.supabase, coverFile, 'blog', 'covers');
				cover_url = result.url;
			} catch (e: any) {
				return fail(400, { error: `Upload failed: ${e.message}` });
			}
		}

		const baseSlug = generateSlug(title);
		const slug = await ensureUniqueSlug(locals.supabase, baseSlug, 'blog_posts');

		try {
			const post = await createPost(locals.supabase, {
				title,
				slug,
				content: content || null,
				excerpt: excerpt || null,
				cover_url,
				is_published,
				published_at: is_published ? new Date().toISOString() : null
			});

			const tagNames = tags_raw
				? tags_raw.split(',').map((t) => t.trim()).filter(Boolean)
				: [];

			if (tagNames.length > 0) {
				await upsertPostTags(locals.supabase, post.id, tagNames);
			}
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/blog');
	}
};
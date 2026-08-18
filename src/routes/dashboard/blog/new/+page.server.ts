import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createPost, getAllTags, upsertPostTags } from '$lib/server/db/blog';
import { uploadFile } from '$lib/utils/upload';
import { generateSlug, ensureUniqueSlug } from '$lib/utils/slug';
import { createSupabaseAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	const tags = await getAllTags(locals.supabase);
	return { tags };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();

		// English version
		const titleEn = (form.get('title_en') as string)?.trim();
		const contentEn = (form.get('content_en') as string)?.trim();
		const excerptEn = (form.get('excerpt_en') as string)?.trim();

		// Indonesian version
		const titleId = (form.get('title_id') as string)?.trim();
		const contentId = (form.get('content_id') as string)?.trim();
		const excerptId = (form.get('excerpt_id') as string)?.trim();

		// Shared fields
		const tags_raw = (form.get('tags') as string)?.trim();
		const is_published = form.get('is_published') === 'on';
		const coverFile = form.get('cover') as File | null;

		if (!titleEn || !titleId) {
			return fail(400, { error: 'Both English and Indonesian titles are required' });
		}

		let cover_url: string | null = null;
		if (coverFile && coverFile.size > 0) {
			try {
				const result = await uploadFile(locals.supabase, coverFile, 'blog', 'covers');
				cover_url = result.url;
			} catch (e: any) {
				return fail(400, { error: `Upload failed: ${e.message}` });
			}
		}

		const baseSlugEn = generateSlug(titleEn);
		const baseSlugId = generateSlug(titleId) + '-id';
		const slugEn = await ensureUniqueSlug(locals.supabase, baseSlugEn, 'blog_posts');
		const slugId = await ensureUniqueSlug(locals.supabase, baseSlugId, 'blog_posts');

		const tagNames = tags_raw
			? tags_raw.split(',').map((t) => t.trim()).filter(Boolean)
			: [];

		try {
			const admin = createSupabaseAdminClient();

			// Create English post
			const postEn = await createPost(locals.supabase, {
				title: titleEn,
				slug: slugEn,
				content: contentEn || null,
				excerpt: excerptEn || null,
				cover_url,
				is_published,
				published_at: is_published ? new Date().toISOString() : null,
				locale: 'en'
			});

			if (tagNames.length > 0) {
				await upsertPostTags(locals.supabase, admin, postEn.id, tagNames);
			}

			// Create Indonesian post
			const postId = await createPost(locals.supabase, {
				title: titleId,
				slug: slugId,
				content: contentId || null,
				excerpt: excerptId || null,
				cover_url,
				is_published,
				published_at: is_published ? new Date().toISOString() : null,
				locale: 'id'
			});

			if (tagNames.length > 0) {
				await upsertPostTags(locals.supabase, admin, postId.id, tagNames);
			}
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/blog');
	}
};
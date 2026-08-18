import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProject } from '$lib/server/db/projects';
import { uploadFile } from '$lib/utils/upload';
import { generateSlug, ensureUniqueSlug } from '$lib/utils/slug';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();

		// English version fields
		const titleEn = (form.get('title_en') as string)?.trim();
		const descriptionEn = (form.get('description_en') as string)?.trim();
		const contentEn = (form.get('content_en') as string)?.trim();

		// Indonesian version fields
		const titleId = (form.get('title_id') as string)?.trim();
		const descriptionId = (form.get('description_id') as string)?.trim();
		const contentId = (form.get('content_id') as string)?.trim();

		// Shared fields
		const tech_stack_raw = (form.get('tech_stack') as string)?.trim();
		const demo_url = (form.get('demo_url') as string)?.trim() || null;
		const repo_url = (form.get('repo_url') as string)?.trim() || null;
		const is_featured = form.get('is_featured') === 'on';
		const is_published = form.get('is_published') === 'on';
		const coverFile = form.get('cover') as File | null;

		if (!titleEn || !titleId) {
			return fail(400, { error: 'Both English and Indonesian titles are required' });
		}

		const tech_stack = tech_stack_raw
			? tech_stack_raw.split(',').map((t) => t.trim()).filter(Boolean)
			: [];

		let cover_url: string | null = null;
		if (coverFile && coverFile.size > 0) {
			try {
				const result = await uploadFile(locals.supabase, coverFile, 'portfolio', 'covers');
				cover_url = result.url;
			} catch (e: any) {
				return fail(400, { error: `Upload failed: ${e.message}` });
			}
		}

		// Generate slugs
		const baseSlugEn = generateSlug(titleEn);
		const baseSlugId = generateSlug(titleId) + '-id';
		const slugEn = await ensureUniqueSlug(locals.supabase, baseSlugEn, 'projects');
		const slugId = await ensureUniqueSlug(locals.supabase, baseSlugId, 'projects');

		try {
			// Create English version
			await createProject(locals.supabase, {
				title: titleEn,
				slug: slugEn,
				description: descriptionEn || null,
				content: contentEn || null,
				cover_url,
				tech_stack,
				demo_url,
				repo_url,
				is_featured,
				is_published,
				order_index: 0,
				locale: 'en'
			});

			// Create Indonesian version
			await createProject(locals.supabase, {
				title: titleId,
				slug: slugId,
				description: descriptionId || null,
				content: contentId || null,
				cover_url, // Same cover for both
				tech_stack,
				demo_url,
				repo_url,
				is_featured,
				is_published,
				order_index: 0,
				locale: 'id'
			});
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/projects');
	}
};
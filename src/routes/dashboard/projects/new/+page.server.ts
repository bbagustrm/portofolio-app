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

		const title = (form.get('title') as string)?.trim();
		const description = (form.get('description') as string)?.trim();
		const content = (form.get('content') as string)?.trim();
		const tech_stack_raw = (form.get('tech_stack') as string)?.trim();
		const demo_url = (form.get('demo_url') as string)?.trim() || null;
		const repo_url = (form.get('repo_url') as string)?.trim() || null;
		const is_featured = form.get('is_featured') === 'on';
		const is_published = form.get('is_published') === 'on';
		const coverFile = form.get('cover') as File | null;

		if (!title) return fail(400, { error: 'Title is required' });

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

		const baseSlug = generateSlug(title);
		const slug = await ensureUniqueSlug(locals.supabase, baseSlug, 'projects');

		try {
			await createProject(locals.supabase, {
				title,
				slug,
				description: description || null,
				content: content || null,
				cover_url,
				tech_stack,
				demo_url,
				repo_url,
				is_featured,
				is_published,
				order_index: 0
			});
		} catch (e: any) {
			return fail(500, { error: e.message });
		}

		redirect(303, '/dashboard/projects');
	}
};
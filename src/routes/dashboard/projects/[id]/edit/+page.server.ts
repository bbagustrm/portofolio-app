import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProjectById, updateProject, deleteProject } from '$lib/server/db/projects';
import { uploadFile } from '$lib/utils/upload';
import { generateSlug } from '$lib/utils/slug';

export const load: PageServerLoad = async ({ params, locals }) => {
	const projectResult = await getProjectById(locals.supabase, params.id);
	if (!projectResult.ok) {
		error(404, 'Project not found');
	}
	return { project: projectResult.value };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
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

		const updateData: Record<string, any> = {
			title,
			description: description || null,
			content: content || null,
			tech_stack,
			demo_url,
			repo_url,
			is_featured,
			is_published
		};

		if (coverFile && coverFile.size > 0) {
		try {
			const result = await uploadFile(locals.supabase, coverFile, 'portfolio', 'covers');
			updateData.cover_url = result.url;
		} catch (e: any) {
			return fail(400, { error: `Upload failed: ${e.message}` });
		}
	}

	const updateResult = await updateProject(locals.supabase, params.id, updateData);
	if (!updateResult.ok) {
		return fail(500, { error: updateResult.error.message });
	}

	redirect(303, '/dashboard/projects');
	}
};
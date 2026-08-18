import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllProjects, deleteProject, updateProject } from '$lib/server/db/projects';
import { unwrapOr } from '$lib/utils/result';

export const load: PageServerLoad = async ({ locals }) => {
	const projectsResult = await getAllProjects(locals.supabase);
	return { projects: unwrapOr(projectsResult, []) };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });

		const result = await deleteProject(locals.supabase, id);
		if (!result.ok) {
			return fail(500, { error: result.error.message });
		}
	},

	toggle_published: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });

		const result = await updateProject(locals.supabase, id, { is_published: !current });
		if (!result.ok) {
			return fail(500, { error: result.error.message });
		}
	},

	toggle_featured: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });

		const result = await updateProject(locals.supabase, id, { is_featured: !current });
		if (!result.ok) {
			return fail(500, { error: result.error.message });
		}
	}
};
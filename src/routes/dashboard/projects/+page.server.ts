import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllProjects, deleteProject, updateProject } from '$lib/server/db/projects';

export const load: PageServerLoad = async ({ locals }) => {
	const projects = await getAllProjects(locals.supabase);
	return { projects };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		if (!id) return fail(400, { error: 'Missing ID' });

		try {
			await deleteProject(locals.supabase, id);
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	},

	toggle_published: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });

		try {
			await updateProject(locals.supabase, id, { is_published: !current });
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	},

	toggle_featured: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const current = form.get('current') === 'true';
		if (!id) return fail(400, { error: 'Missing ID' });

		try {
			await updateProject(locals.supabase, id, { is_featured: !current });
		} catch (e: any) {
			return fail(500, { error: e.message });
		}
	}
};
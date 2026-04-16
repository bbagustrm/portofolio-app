import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectBySlug } from '$lib/server/db/projects';

export const load: PageServerLoad = async ({ params, locals }) => {
	const project = await getProjectBySlug(locals.supabase, params.slug);

	if (!project || !project.is_published) {
		error(404, 'Project not found');
	}

	return { project };
};